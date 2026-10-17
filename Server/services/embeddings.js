const { config } = require('dotenv');

const MODEL = 'gemini-embedding-001';
const DIMENSIONS = 768;
const BATCH_SIZE = 50;

let aiClient;

//gemini SDK ko lazily initialize krna

const getAIClient = async () => {
    
    if(!process.env.GEMINI_API_KEY){
        throw new Error('GEMINI_API_KEY is Missing in .env');
    }

    if(!aiClient){
        const {GoogleGenAI} = await import('@google/genai');

        aiClient = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
    }
    return aiClient;
};

//text chunks ko embdiing mein convert karna
const embedTexts = async (texts, taskType = 'RETRIEVAL_DOCUMENT') => {
    if(!Array.isArray(texts)){
        throw new Error('texts must be an array');
    }

    if(texts.length === 0){
        return [];
    }
    const ai = await getAIClient();
    const vectors = [];

    //bade inpt kko batches mein process krna
    for(let i =0; i<texts.length; i += BATCH_SIZE){
        const batch = texts.slice(i, i + BATCH_SIZE);

        const response = await ai.models.embedContent({
            model:MODEL,
            contents: batch,
            config:{
                outputDimensionality: DIMENSIONS,
                taskType
            }
        });

        if(!response.embeddings || response.embeddings.length !== batch.length)
        {
            throw new Error('Embedding response count mismatch');
        }

        //Har chunk ka vector result mein add karna
        vectors.push(
            ...response.embeddings.map((embedding)=> embedding.values)
        );
    }
    return vectors;
};

module.exports = {
    embedTexts,
}

