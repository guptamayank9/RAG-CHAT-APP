const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
    documentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
        index: true,
    },
    chunkIndex :{
        type: Number,
        required: true,
    },
    embedding :{
        type:[Number],
        required:true
    },
});

module.exports = mongoose.model("Chunk" , chunkSchema);