const {GoogleGenAI} = require('@google/genai');
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const SYSTEM_PROMPT= `You are a helpful assistant that answers question about a document.
Use ONLY the context provided below to answer.
If the answer is not in the context, say "I couldn't find this in the document."
Do not make up information. Keep the answer clear and concise.`;

const generateAnswer = async( question, chunks) =>{
    const context = chunks
    .map((c,i)=> `[${i+1}] ${c.text}`)
    .join("\n\n");


const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    contents: `Context:\n${context}\n\nQuestion: ${question}`,
    config:{
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
    },
});

 return response.text;
}

module.exports = {
    generateAnswer
};
