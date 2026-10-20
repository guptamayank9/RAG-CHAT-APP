const mongoose = require('mongoose');
const Chunk = require('../models/Chunk');
const {embedTexts} = require('./embeddings');

// Ye function question se related PDF chunks retrieve karega.
// question = user ka sawaal
// documentId = optional, kisi specific PDF mein search karne ke liye
// limit = maximum kitne chunks chahiye; default 4

const retrievalChunks =async (question, documentId, limit=4) => {
    const [queryVector] = await embedTexts(
        [question],'RETRIEVAL_QUERY'
    );
    const vectorStage = {
        index: "vector_index",
        path:"embedding",
        queryVector,
        numCandidates: 100,
        limit,
    };
    if(documentId){
        vectorStage.filter= {
             // String ID ko MongoDB ObjectId mein convert karo.
         document: new mongoose.Types.ObjectId(documentId),
        };
    }
      // Step 4: Atlas mein search chalao aur relevant chunks return karo.

      return Chunk.aggregate([
        {
            $vectorSearch: vectorStage
        },
        {
            $project:{
                _id: 0,
                documentId: 1,
                chunkIndex: 1,
                text: 1,//pdf k actual text
                score:{
                    $meta: "vectorSearchScore"//similarity score
                },
            },
        },
      ]);

};
module.exports = {
    retrievalChunks,
}

