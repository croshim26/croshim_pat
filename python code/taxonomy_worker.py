"""Classify queued Croshim Studio patterns with OpenAI.

Run once:    python "python code/taxonomy_worker.py" --once
Keep running: python "python code/taxonomy_worker.py" --watch --interval 60
"""

import argparse
import json
import os
import time
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
MODEL = os.environ.get("TAXONOMY_MODEL", "gpt-4.1-mini")
MAX_ATTEMPTS = 3

PATTERN_TYPES = [
    "amigurumi", "clothing", "baby_kids", "hats_headwear", "scarves_shawls",
    "bags_purses", "accessories", "home_decor", "blankets_throws",
    "flowers_appliques", "seasonal_gifts", "other",
]
PATTERN_FORMATS = ["2d", "3d", "other"]
TYPE_LABELS = {
    "amigurumi": ("Amigurumi", "أميجورومي"), "clothing": ("Clothing", "ملابس"),
    "baby_kids": ("Baby & Kids", "أطفال ورُضّع"), "hats_headwear": ("Hats & Headwear", "قبعات"),
    "scarves_shawls": ("Scarves & Shawls", "أوشحة وشالات"), "bags_purses": ("Bags & Purses", "حقائب ومحافظ"),
    "accessories": ("Accessories", "إكسسوارات"), "home_decor": ("Home Décor", "ديكور منزلي"),
    "blankets_throws": ("Blankets & Throws", "بطانيات"), "flowers_appliques": ("Flowers & Appliqués", "ورود وتطبيقات"),
    "seasonal_gifts": ("Seasonal & Gifts", "موسمي وهدايا"), "other": ("Other", "أخرى"),
}
FORMAT_LABELS = {"2d": ("2D", "ثنائي الأبعاد (2D)"), "3d": ("3D", "ثلاثي الأبعاد (3D)"), "other": ("Other", "أخرى")}

SCHEMA = {
    "type": "object", "additionalProperties": False,
    "properties": {
        "formal_name_en": {"type": "string"}, "formal_name_ar": {"type": "string"},
        "pattern_type": {"type": "string", "enum": PATTERN_TYPES},
        "pattern_format": {"type": "string", "enum": PATTERN_FORMATS},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
    },
    "required": ["formal_name_en", "formal_name_ar", "pattern_type", "pattern_format", "confidence"],
}

INSTRUCTIONS = """
You classify crochet patterns. Choose exactly one pattern_type and one pattern_format.
pattern_type: amigurumi = stuffed figures/toys; clothing = garments excluding hats/scarves/baby;
baby_kids = items for children; hats_headwear = hats/headbands; scarves_shawls = neck wraps;
bags_purses = bags/pouches/wallets; accessories = other wearable accessories; home_decor = décor;
blankets_throws = blankets; flowers_appliques = flat flowers/motifs; seasonal_gifts = holiday/gifts;
other = none of the above. pattern_format: 2d = primarily flat; 3d = volumetric/stuffed;
other = cannot determine. Return formal_name_en and formal_name_ar. If the input name is unclear,
create a neutral name based only on supplied text. Do not invent information. If insufficient use
exactly “Unidentified Crochet Pattern” and “باترون كروشيه غير محدد”.
"""


def connect_database():
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        sslmode = "disable" if ("localhost" in database_url or "127.0.0.1" in database_url) else "require"
        return psycopg2.connect(database_url, sslmode=sslmode)
    settings = {"host": os.environ.get("DB_HOST", "localhost"), "dbname": os.environ.get("DB_NAME"),
                "user": os.environ.get("DB_USER"), "password": os.environ.get("DB_PASSWORD"),
                "port": os.environ.get("DB_PORT", "5432"), "sslmode": "disable"}
    if not all([settings["dbname"], settings["user"], settings["password"]]):
        raise RuntimeError("Set DATABASE_URL, or DB_NAME, DB_USER, and DB_PASSWORD.")
    return psycopg2.connect(**settings)


def compact(value, limit):
    return "" if value is None else str(value).strip()[:limit]


def claim_job(conn):
    with conn.cursor() as cursor:
        cursor.execute("""
            WITH next_job AS (
              SELECT id FROM pattern_classification_jobs WHERE status = 'pending'
              ORDER BY created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1
            ) UPDATE pattern_classification_jobs jobs
            SET status = 'processing', attempts = attempts + 1, updated_at = NOW()
            FROM next_job WHERE jobs.id = next_job.id
            RETURNING jobs.id, jobs.saved_pattern_id, jobs.attempts
        """)
        job = cursor.fetchone()
    conn.commit()
    return job


def load_pattern(conn, pattern_id):
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, name, subtitle, tools, parts FROM saved_patterns WHERE id = %s", (pattern_id,))
        row = cursor.fetchone()
    if not row:
        raise RuntimeError("The saved pattern no longer exists.")
    return dict(zip(("id", "name", "subtitle", "tools", "parts"), row))


def classify(client, pattern):
    source = f"""Pattern ID: {pattern['id']}
Name: {compact(pattern['name'], 500)}
Subtitle: {compact(pattern['subtitle'], 1000)}
Tools: {compact(pattern['tools'], 2500)}
Parts / instructions: {compact(pattern['parts'], 6000)}"""
    response = client.responses.create(
        model=MODEL, instructions=INSTRUCTIONS, input=source, store=False,
        text={"format": {"type": "json_schema", "name": "crochet_pattern_taxonomy", "strict": True, "schema": SCHEMA}},
    )
    return json.loads(response.output_text)


def save_taxonomy(conn, pattern_id, result):
    type_en, type_ar = TYPE_LABELS[result["pattern_type"]]
    format_en, format_ar = FORMAT_LABELS[result["pattern_format"]]
    with conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO pattern_taxonomies (
              saved_pattern_id, formal_name_en, formal_name_ar, pattern_type, pattern_type_en, pattern_type_ar,
              pattern_format, pattern_format_en, pattern_format_ar, confidence, classifier_model,
              classified_at, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), NOW())
            ON CONFLICT (saved_pattern_id) DO UPDATE SET
              formal_name_en = EXCLUDED.formal_name_en, formal_name_ar = EXCLUDED.formal_name_ar,
              pattern_type = EXCLUDED.pattern_type, pattern_type_en = EXCLUDED.pattern_type_en,
              pattern_type_ar = EXCLUDED.pattern_type_ar, pattern_format = EXCLUDED.pattern_format,
              pattern_format_en = EXCLUDED.pattern_format_en, pattern_format_ar = EXCLUDED.pattern_format_ar,
              confidence = EXCLUDED.confidence, classifier_model = EXCLUDED.classifier_model,
              classified_at = NOW(), updated_at = NOW()
        """, (pattern_id, result["formal_name_en"], result["formal_name_ar"], result["pattern_type"],
              type_en, type_ar, result["pattern_format"], format_en, format_ar,
              float(result["confidence"]), MODEL))
        cursor.execute("""
            UPDATE pattern_classification_jobs
            SET status = 'completed', error_message = NULL, processed_at = NOW(), updated_at = NOW()
            WHERE saved_pattern_id = %s
        """, (pattern_id,))
    conn.commit()


def record_failure(conn, job_id, attempts, error):
    status = "failed" if attempts >= MAX_ATTEMPTS else "pending"
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE pattern_classification_jobs SET status = %s, error_message = %s, updated_at = NOW()
            WHERE id = %s
        """, (status, str(error)[:4000], job_id))
    conn.commit()


def process_pending_jobs():
    client = OpenAI()
    processed = 0
    with connect_database() as conn:
        while True:
            job = claim_job(conn)
            if not job:
                return processed
            job_id, pattern_id, attempts = job
            try:
                result = classify(client, load_pattern(conn, pattern_id))
                save_taxonomy(conn, pattern_id, result)
                processed += 1
                print(f"✓ Pattern {pattern_id}: {result['formal_name_en']}")
            except Exception as error:
                conn.rollback()
                record_failure(conn, job_id, attempts, error)
                print(f"✗ Pattern {pattern_id}: {error}")


def print_status():
    with connect_database() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT status, COUNT(*) FROM pattern_classification_jobs GROUP BY status ORDER BY status")
            rows = cursor.fetchall()
    print("Queue is empty." if not rows else "\n".join(f"{status}: {count}" for status, count in rows))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--watch", action="store_true")
    parser.add_argument("--status", action="store_true")
    parser.add_argument("--interval", type=int, default=60)
    args = parser.parse_args()
    if args.status:
        print_status()
    elif args.once or args.watch:
        while True:
            print(f"Processed {process_pending_jobs()} job(s).")
            if not args.watch:
                break
            time.sleep(max(args.interval, 5))
    else:
        parser.error("Choose --once, --watch, or --status.")
