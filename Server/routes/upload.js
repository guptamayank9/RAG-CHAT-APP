// ye code kaafi important hai. Ye tere project ka
// PDF Upload & Text Extraction API hai. Iska kaam PDF
//  file lena, uske andar ka text nikalna aur frontend ko response bhejna hai.
const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse/lib/pdf-parse.js");
const chunkText = require("../utils/chunkText");
const { embedTexts } = require("../services/embeddings");
const Document = require("../models/Document");
const Chunk = require("../models/Chunk");
const crypto = require("crypto");

const router = express.Router();

// PDF file ko memory mein temporarily store karenge.
// Disk par file save nahi hogi.
const upload = multer({
  storage: multer.memoryStorage(),

  //max pdf size :10MB
  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  // Check karenge ki uploaded file PDF hai ya nahi.
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true); //file accpt karo
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// POST /api/pdf
// "file" naam ke multipart form field se PDF receive hogi.
router.post("/", upload.single("file"), async (req, res) => {
  try {
    // Agar user ne file upload nahi ki, toh error return karo.
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    // File ka fingerprint: same PDF ka hash hamesha same aata hai
    const fileHash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    // Agar ye PDF pehle upload ho chuki hai, to dobara process mat karo
    const existing = await Document.findOne({ fileHash });
    if (existing) {
      return res.json({
        documentId: existing._id,
        fileName: existing.fileName,
        pages: existing.pages,
        totalChunks: existing.totalChunks,
        alreadyUploaded: true,
      });
    }

    //uploaded PDf ke buffer se text extract karo
    const data = await pdf(req.file.buffer);
    const chunks = chunkText(data.text);

    if (chunks.length === 0) {
      return res.status(400).json({
        error: "No text found in PDF (scanned PDF?)",
      });
    }
    const vectors = await embedTexts(chunks);

    const doc = await Document.create({
      fileName: req.file.originalname,
      pages: data.numpages,
      totalChunks: chunks.length,
      fileHash,
    });

    const chunkDocs = chunks.map((text, i) => ({
      documentId: doc._id,
      chunkIndex: i,
      text,
      embedding: vectors[i],
    }));

    try {
      await Chunk.insertMany(chunkDocs);
    } catch (err) {
      await Document.findByIdAndDelete(doc._id);
      throw err;
    }
    //fornt ko pdf ki infor return karo
    res.json({
      documentId: doc._id,
      fileName: doc.fileName,
      pages: data.numpages,
      totalChunks: doc.totalChunks,
      // totalVectors: vectors.length,
      // dimensions: vectors[0].length,
      // sampleVector: vectors[0].slice(0, 5),
      // characters: data.text.length,
      // totalChunks: chunks.length,
      // firstChunks: chunks.slice(0, 3),
    });
  } catch (error) {
    console.error("PDF processing Failed : ", error);
    res.status(500).json({
      error: "Failed to process PDF",
    });
  }
});

module.exports = router;
