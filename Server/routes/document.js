const express = require('express');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const Chunk = require('../models/Chunk');

const router = express.Router();



// DELETE /api/documents/:id
// Document aur uske saare chunks hata deta hai

router.delete('/:id', async (req, res) => {
    try{
        const {id} = req.params;

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                error:"Invalid document id"
            });
        }

        const doc =await Document.findByIdAndDelete(id);

        if (!doc) {
          return res.status(404).json({ error: 'Document not found' });
        }

        const result = await Chunk.deleteMany({documentId:id});

        res.json({
            message:'Document deleted',
            deletedChunks: result.deletedCount,
        });


    }catch(error){
      console.error(error);
      res.status(500).json({
        error:"Delete Failed"
      });
    }
});

module.exports =router;