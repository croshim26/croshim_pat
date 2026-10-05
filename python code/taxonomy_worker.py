"""Classify queued Croshim Studio patterns with OpenAI.

Run once:    python taxonomy_worker.py --once
Keep running: python taxonomy_worker.py --watch --interval 60

Required environment variable: OPENAI_API_KEY.
Database settings may be DATABASE_URL, or the local DB_HOST, DB_NAME, DB_USER,
DB_PASSWORD, and DB_PORT values in the project's .env file.
"""

import argparse
import json
import os
import time
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from openai import OpenAI


# Local development uses the same .env file as the Node.js application. On
# Heroku, config vars are already present in the process environment.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

MODEL = os.environ.get("TAXONOMY_MODEL", "gpt-4.1-mini")
MAX_ATTEMPTS = 3

PATTERN_TYPES = [
    "amigurumi", "clothing", "baby_kids", "hats_headwear",
    "scarves_shawls", "bags_purses", "accessories", "home_decor",
    "blankets_throws", "flowers_appliques", "seasonal_gifts", "other",
]
PATTERN_FORMATS = ["2d", "3d", "other"]

PATTERN_TYPE_LABELS = {
    "amigurumi": {"en": "Amigurumi", "ar": "أميجورومي"},
    "clothing": {"en": "Clothing", "ar": "ملابس"},
    "baby_kids": {"en": "Baby & Kids", "ar": "أطفال ورُضّع"},
    "hats_headwear": {"en": "Hats & Headwear", "ar": "قبعات"},
    "scarves_shawls": {"en": "Scarves & Shawls", "ar": "أوشحة وشالات"},
    "bags_purses": {"en": "Bags & Purses", "ar": "حقائب ومحافظ"},
    "accessories": {"en": "Accessories", "ar": "إكسسوارات"},
    "home_decor": {"en": "Home Décor", "ar": "ديكور منزلي"},
    "blankets_throws": {"en": "Blankets & Throws", "ar": "بطانيات"},
    "flowers_appliques": {"en": "Flowers & Appliqués", "ar": "ورود وتطبيقات"},
    "seasonal_gifts": {"en": "Seasonal & Gifts", "ar": "موسمي وهدايا"},
    "other": {"en": "Other", "ar": "أخرى"},
}
PATTERN_FORMAT_LABELS = {
    "2d": {"en": "2D", "ar": "ثنائي الأبعاد (2D)"},
    "3d": {"en": "3D", "ar": "ثلاثي الأبعاد (3D)"},
    "other": {"en": "Other", "ar": "أخرى"},
}

SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "formal_name_en": {"type": "string"},
        "formal_name_ar": {"type": "string"},
        "pattern_type": {"type": "string", "enum": PATTERN_TYPES},
        "pattern_format": {"type": "string", "enum": PATTERN_FORMATS},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
    },
    "required": ["formal_name_en", "formal_name_ar", "pattern_type", "pattern_format", "confidence"],
}

INSTRUCTIONS = """
You classify crochet patterns. Choose exactly one pattern_type and one pattern_format.

pattern_type definitions:
- amigurumi: stuffed figures, dolls, animals, or toys, usually built in rounds.
- clothing: garments other than hats, scarves, shawls, or baby-specific items.
- baby_kids: an item mainly intended for babies or children.
- hats_headwear: hats, beanies, crowns, hair coverings, or headbands.
- scarves_shawls: scarves, shawls, wraps, or neck warmers.
- bags_purses: bags, purses, pouches, backpacks, or wallets.
- accessories: wearable accessories not covered elsewhere.
- home_decor: décor such as coasters, baskets, rugs, cushions, or kitchen items.
- blankets_throws: blankets, throws, or quilts.
- flowers_appliques: flat flowers, leaves, motifs, appliqués, and decorations.
- seasonal_gifts: a pattern whose main purpose is a holiday, seasonal decoration, or gift.
- other: use only when none of the above fit.

pattern_format definitions:
- 2d: primarily flat, such as an appliqué, motif, coaster, or flat panel.
- 3d: has volume, is stuffed, or is constructed as an object to stand or hold shape.
- other: cannot be determined from the available data.

Also return a formal bilingual name for every pattern:
- formal_name_en: concise, clear English pattern name.
- formal_name_ar: concise, clear Arabic pattern name.

If the supplied name is unclear, generic, or missing, create a neutral descriptive title
from only the supplied text. Do not invent characters, brands, materials, or purposes.
If there is not enough information, use exactly “Unidentified Crochet Pattern” and
“باترون كروشيه غير محدد”. Use only the supplied text.
"""


def database_connection():
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        sslmode = "disable" if ("localhost" in database_url or "127.0.0.1" in database_url) else "require"
        return psycopg2.connect(database_url, sslmode=sslmode)

    settings = {
        "host": os.environ.get("DB_HOST", "localhost"),
        "dbname": os.environ.get("DB_NAME"),
        "user": os.environ.get("DB_USER"),
        "password": os.environ.get("DB_PASSWORD"),
        "port": os.environ.get("DB_PORT", "5432"),
        "sslmode": "disable",
    }
    if not all([settings["dbname"], settings["user"], settings["password"]]):
        raise RuntimeError("Set DATABASE_URL, or DB_NAME, DB_USER, and DB_PASSWORD in .env.")
    return psycopg2.connect(**settings)


def text(value, limit):
    if value is None:
        return ""
    return str(value).strip()[:limit]


def claim_next_job(conn):
    """Atomically claim one pending job so two workers never classify it twice."""
    with conn.cursor() as cursor:
        cursor.execute("""
            WITH next_job AS (
              SELECT id
              FROM pattern_classification_jobs
              WHERE status = 'pending'
              ORDER BY created_at ASC
              FOR UPDATE SKIP LOCKED
              LIMIT 1
            )
            UPDATE pattern_classification_jobs jobs
            SET status = 'processing', attempts = attempts + 1, updated_at = NOW()
            FROM next_job
            WHERE jobs.id = next_job.id
            RETURNING jobs.id, jobs.saved_pattern_id, jobs.attempts
        """)
        job = cursor.fetchone()
    conn.commit()
    return job


def load_pattern(conn, saved_pattern_id):
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT id, name, subtitle, tools, parts
            FROM saved_patterns
            WHERE id = %s
        """, (saved_pattern_id,))
        row = cursor.fetchone()
    if not row:
        raise RuntimeError("The saved pattern no longer exists.")
    return dict(zip(["id", "name", "subtitle", "tools", "parts"], row))


def classify(client, pattern):
    source_text = f"""
Pattern ID: {pattern['id']}
Name: {text(pattern['name'], 500)}
Subtitle: {text(pattern['subtitle'], 1000)}
Tools: {text(pattern['tools'], 2500)}
Parts / instructions: {text(pattern['parts'], 6000)}
"""
    response = client.responses.create(
        model=MODEL,
        instructions=INSTRUCTIONS,
        input=source_text,
        store=False,
        text={"format": {
            "type": "json_schema",
            "name": "crochet_pattern_taxonomy",
            "strict": True,
            "schema": SCHEMA,
        }},
    )
    return json.loads(response.output_text)


def save_taxonomy(conn, saved_pattern_id, result):
    type_labels = PATTERN_TYPE_LABELS[result["pattern_type"]]
    format_labels = PATTERN_FORMAT_LABELS[result["pattern_format"]]
    with conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO pattern_taxonomies (
              saved_pattern_id, formal_name_en, formal_name_ar,
              pattern_type, pattern_type_en, pattern_type_ar,
              pattern_format, pattern_format_en, pattern_format_ar,
              confidence, classifier_model, classified_at, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), NOW())
            ON CONFLICT (saved_pattern_id) DO UPDATE SET
              formal_name_en = EXCLUDED.formal_name_en,
              formal_name_ar = EXCLUDED.formal_name_ar,
              pattern_type = EXCLUDED.pattern_type,
              pattern_type_en = EXCLUDED.pattern_type_en,
              pattern_type_ar = EXCLUDED.pattern_type_ar,
              pattern_format = EXCLUDED.pattern_format,
              pattern_format_en = EXCLUDED.pattern_format_en,
              pattern_format_ar = EXCLUDED.pattern_format_ar,
              confidence = EXCLUDED.confidence,
              classifier_model = EXCLUDED.classifier_model,
              classified_at = NOW(), updated_at = NOW()
        """, (
            saved_pattern_id, result["formal_name_en"], result["formal_name_ar"],
            result["pattern_type"], type_labels["en"], type_labels["ar"],
            result["pattern_format"], format_labels["en"], format_labels["ar"],
            float(result["confidence"]), MODEL,
        ))
        cursor.execute("""
            UPDATE pattern_classification_jobs
            SET status = 'completed', error_message = NULL, processed_at = NOW(), updated_at = NOW()
            WHERE saved_pattern_id = %s
        """, (saved_pattern_id,))
    conn.commit()


def mark_failure(conn, job_id, attempts, error):
    next_status = "failed" if attempts >= MAX_ATTEMPTS else "pending"
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE pattern_classification_jobs
            SET status = %s, error_message = %s, updated_at = NOW()
            WHERE id = %s
        """, (next_status, str(error)[:4000], job_id))
    conn.commit()


def process_all_pending_jobs():
    client = OpenAI()
    processed = 0
    with database_connection() as conn:
        while True:
            job = claim_next_job(conn)
            if not job:
                break
            job_id, pattern_id, attempts = job
            try:
                result = classify(client, load_pattern(conn, pattern_id))
                save_taxonomy(conn, pattern_id, result)
                processed += 1
                print(f"✓ Pattern {pattern_id}: {result['formal_name_en']}")
            except Exception as error:
                # A failed SQL statement aborts the current PostgreSQL
                # transaction. Roll it back before recording the job failure.
                conn.rollback()
                mark_failure(conn, job_id, attempts, error)
                print(f"✗ Pattern {pattern_id}: {error}")
    return processed


def print_queue_status():
    """Show queue counts without making an OpenAI request."""
    with database_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT status, COUNT(*)
                FROM pattern_classification_jobs
                GROUP BY status
                ORDER BY status
            """)
            rows = cursor.fetchall()
    if not rows:
        print("Queue is empty. Create a new pattern first.")
        return
    for status, count in rows:
        print(f"{status}: {count}")


def retry_processing_jobs():
    """Manually recover jobs left in processing after an interrupted worker."""
    with database_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE pattern_classification_jobs
                SET status = 'pending', error_message = NULL, updated_at = NOW()
                WHERE status = 'processing'
            """)
            recovered = cursor.rowcount
        conn.commit()
    print(f"Returned {recovered} interrupted job(s) to pending.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Process all currently pending jobs, then exit.")
    parser.add_argument("--watch", action="store_true", help="Keep polling for new jobs.")
    parser.add_argument("--status", action="store_true", help="Show queue counts without calling OpenAI.")
    parser.add_argument("--retry-processing", action="store_true", help="Return interrupted processing jobs to pending.")
    parser.add_argument("--interval", type=int, default=60, help="Polling interval in seconds (default: 60).")
    args = parser.parse_args()

    if args.status:
        print_queue_status()
        raise SystemExit(0)

    if args.retry_processing:
        retry_processing_jobs()
        raise SystemExit(0)

    if not args.once and not args.watch:
        parser.error("Choose --once, --watch, --status, or --retry-processing.")

    while True:
        count = process_all_pending_jobs()
        print(f"Processed {count} job(s).")
        if not args.watch:
            break
        time.sleep(max(args.interval, 5))


