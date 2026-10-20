const express = require('express');
const {retrieveChunks} = require('../services/retrieval');


const router = express.Router();


router.post('/' ,async (req, res) => {

    try {
        const {question , documentId} =req.body;

    // Check: question missing hai ya empty hai?
    // trim() question ke aage-peeche ki spaces hatata hai.
        if(!question || !question.trim()){
            return res.status(400).json({
                error:"Question is required"
            });
        }
       // Retrieval service ko question aur documentId do.
    // Ye question ki embedding banakar Atlas mein search karega.
    // Default mein maximum 4 relevant chunks milenge.
        const results = await retrieveChunks(question, documentId);

 // Question aur search results client ko JSON mein bhejo.
        res.json({
            question, 
            results 
        });
        
    } catch (error) {
       console.error(error);
       res.status(500).json({ error: "Search failed" });
        
    }
    
})
module.exports =router;