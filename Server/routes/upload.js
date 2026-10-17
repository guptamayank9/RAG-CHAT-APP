// ye code kaafi important hai. Ye tere project ka 
// PDF Upload & Text Extraction API hai. Iska kaam PDF
//  file lena, uske andar ka text nikalna aur frontend ko response bhejna hai.

const express = require('express');
const multer= require('multer');
const pdf = require('pdf-parse/lib/pdf-parse.js');
const chunkText = require('../utils/chunkText');

const router = express.Router();

// PDF file ko memory mein temporarily store karenge.
// Disk par file save nahi hogi.
const upload = multer({

    storage : multer.memoryStorage(),

    //max pdf size :10MB
    limits :{
        fileSize :10 *1024 * 1024
    },


    // Check karenge ki uploaded file PDF hai ya nahi.
    fileFilter : (req, file ,cb) => {

        if(file.mimetype === 'application/pdf'){
            cb(null, true); //file accpt karo
        }else{
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// POST /api/pdf
// "file" naam ke multipart form field se PDF receive hogi.
router.post('/', upload.single('file'), async(req, res) => {

    try {
      // Agar user ne file upload nahi ki, toh error return karo.
      if(!req.file){
        return res.status(400).json({
            error:"No file uploaded"
        });
      }
     
      //uploaded PDf ke buffer se text extract karo
      const data = await pdf(req.file.buffer);
      const chunks = chunkText(data.text);

      //fornt ko pdf ki infor return karo
      res.status(200).json({
        fileName: req.file.originalname,
        pages:data.numpages,
        characters: data.text.length,
        totalChunks: chunks.length,
        firstChunks: chunks.slice(0, 3),
      });
        
    } catch (error) {
        console.error('PDF processing Failed : ', error);
        res.status(500).json({
            error:"Failed to process PDF"
        });
    }
});

module.exports = router;