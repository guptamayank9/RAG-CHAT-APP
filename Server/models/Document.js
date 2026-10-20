const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
    fileName : {
        type:String,
        required: true
    },
    pages:{
        type: Number,
        required : true,
    },
    totalChunks : {
        type: Number,
        required: true
    },
},
    {
        timestamps: true
    }
);
module.exports = mongoose.model("Document", documentSchema);