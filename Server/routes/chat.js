const express = require('express');
const {retrieveChunks} = require('../services/retrieval');
const {generateAnswer} = require('../services/llm');


const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {question, documentId} = req.body;

        if(!question || !question.trim()){
            return res.status(400).json({
                error:"Question is required"
            });
        }

        const chunks = await retrieveChunks(question , documentId);

        if(chunks.length===0){
            return res.json({
                answer: "I couldn't find anything relevant in the document.",
                sources: [],
            });
        }

        const answer = await generateAnswer(question, chunks);
        const sources = chunks.map((c)=>({
            chunkIndex: c.chunkIndex,
            score: c.score,
            preview: c.text.slice(0,200),
        }));

        res.json({
            answer,
            sources
        });

        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error:"Chat failed"
        });      
    }
    
});

module.exports = router;