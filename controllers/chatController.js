const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a friendly and knowledgeable Crochet Hub assistant specializing in crochet patterns, stitches, and techniques.

You help users with:
- Understanding crochet pattern abbreviations (SC, DC, CH, SL ST, HDC, TR, etc.)
- Learning about different crochet stitches and techniques (magic ring, turning chains, joining rounds, etc.)
- Getting pattern recommendations based on skill level (beginner, intermediate, advanced)
- Understanding yarn weights (fingering, DK, worsted, bulky) and choosing the right hook sizes
- Reading and understanding PDF crochet patterns
- Troubleshooting common crochet problems (tight tension, dropped stitches, uneven edges, etc.)
- Estimating yarn amounts needed for a project

Keep your responses concise, friendly, and practical. Always respond in the same language as the user's message — if they write in Arabic, respond in Arabic; if they write in English, respond in English. If the question is not related to crochet or knitting, politely redirect the user back to crochet topics.

You are part of the Crochet Hub platform — a community for crochet enthusiasts to share products and PDF patterns.`;

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "الرسالة مطلوبة." });
    }

    const trimmedMessage = message.trim().slice(0, 2000);

    const messages = [];

    if (Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        if (
          (msg.role === "user" || msg.role === "assistant") &&
          typeof msg.content === "string" &&
          msg.content.trim()
        ) {
          messages.push({ role: msg.role, content: msg.content.trim() });
        }
      }
    }

    messages.push({ role: "user", content: trimmedMessage });

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    return res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "حدث خطأ، يرجى المحاولة مجدداً." });
  }
};
