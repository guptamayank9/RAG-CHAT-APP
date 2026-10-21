# Chat with your Documents (RAG)

Upload a PDF and ask questions about it in plain English. Answers are generated from the document's own content and shown with the exact source chunks, so every answer can be verified.

**Live demo:** [add link after deploy]


## How it works

This is a Retrieval-Augmented Generation (RAG) pipeline:

1. **Upload:** the PDF is parsed and its text is extracted.
2. **Chunking:** text is split into ~1000-character chunks with 200-character overlap, so sentences cut at a boundary keep their context.
3. **Embeddings:** each chunk is converted to a 768-dimension vector using Google's `gemini-embedding-001`.
4. **Storage:** chunks and vectors are stored in MongoDB Atlas.
5. **Retrieval:** the user's question is embedded and matched against chunks with Atlas Vector Search (cosine similarity).
6. **Generation:** the top matching chunks and the question are sent to a Gemini model, which is instructed to answer only from that context.
7. **Sources:** the answer is returned along with the chunks it was based on.

```
React (Vite)  -->  Express API  -->  MongoDB Atlas (chunks + vector index)
                       |
                       +--> Gemini embeddings (text -> vectors)
                       +--> Gemini LLM (question + context -> answer)
```

## Tech stack

- **Frontend:** React, Vite, Axios, react-markdown
- **Backend:** Node.js, Express, Mongoose, Multer, pdf-parse
- **Database:** MongoDB Atlas with Vector Search
- **AI:** Google Gemini (embeddings and generation)

## Features

- PDF upload with text extraction
- Semantic search over document chunks
- Answers grounded in the document, with expandable sources
- "Not found" response when the answer is not in the document
- Duplicate upload detection using SHA-256 file hashing (no repeated embedding cost)
- Retry with backoff when the AI API is temporarily overloaded
- Delete a document together with all its chunks

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload a PDF (`multipart/form-data`, field `file`) |
| POST | `/api/chat` | Body: `{ "question", "documentId" }`. Returns answer and sources |
| POST | `/api/search` | Returns the top matching chunks without calling the LLM |
| DELETE | `/api/documents/:id` | Deletes a document and its chunks |
| GET | `/api/health` | Health check |

## Run locally

**Prerequisites:** Node.js 18+, a MongoDB Atlas cluster (free M0), and a Gemini API key from Google AI Studio.

```bash
git clone [your-repo-url]
cd [repo-folder]
```

**1. Atlas vector index**

In Atlas, open the `chunks` collection, then Search Indexes, Create Search Index, Vector Search (JSON editor). Name it `vector_index`:

```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 768, "similarity": "cosine" },
    { "type": "filter", "path": "documentId" }
  ]
}
```

**2. Backend**

```bash
cd Server
npm install
```

Create `Server/.env`:

```
PORT=5000
MONGODB_URI=your_atlas_connection_string
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=your_gemini_flash_model
```

```bash
npm run dev
```

**3. Frontend**

```bash
cd Client
npm install
npm run dev
```

Open `http://localhost:5173`.

## Project structure

```
Server/
  config/       database connection
  models/       Document, Chunk schemas
  routes/       upload, chat, search, documents
  services/     embeddings, retrieval, llm
  utils/        text chunking
Client/
  src/components/   UploadBox, Chat
```

## What I learned

- How embeddings and vector search work, and why chunk size and overlap affect answer quality
- Designing a RAG prompt that reduces hallucination
- Handling third-party API failures (rate limits, 503s) with retries
- Debugging a silent data loss: Mongoose drops fields missing from the schema without any error

## Future improvements

- Support multiple documents in one chat
- Streaming responses
- Chat history and follow-up questions
- OCR for scanned PDFs
