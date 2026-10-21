const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are a helpful assistant that answers questions about a document.
Use ONLY the context provided below to answer.
If the answer is not in the context, say "I couldn't find this in the document."
Do not make up information. Keep the answer clear and concise.`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateAnswer = async (question, chunks) => {
  const context = chunks.map((c, i) => `[${i + 1}] ${c.text}`).join("\n\n");
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  const MAX_ATTEMPTS = 4;
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `Context:\n${context}\n\nQuestion: ${question}`,
        config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.2 },
      });
      return response.text;
    } catch (err) {
      lastError = err;

      // Sirf temporary errors pe dobara try karo
      if (![429, 500, 503].includes(err.status)) throw err;

      console.warn(`LLM busy (attempt ${attempt}/${MAX_ATTEMPTS}), retrying...`);
      await sleep(1500 * attempt); // 1.5s, 3s, 4.5s, 6s
    }
  }

  throw lastError;
};

module.exports = { generateAnswer };