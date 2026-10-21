import { useState } from "react";
import axios from "axios";
import UploadBox from "./components/UploadBox";
import Chat from "./components/Chat";
import api from "../api";


export default function App() {
  const [doc, setDoc] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    const ok = window.confirm(
      "Delete this document and all its data? This cannot be undone."
    );
    if (!ok) return;

    setDeleting(true);
    setError("");

    try {
      await api.delete(`/api/documents/${doc.documentId}`);
      setDoc(null); // upload screen pe wapas
    } catch (err) {
      setError(err.response?.data?.error || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container">
      <h1>Chat with your Documents</h1>

      {!doc ? (
        <UploadBox onUploaded={setDoc} />
      ) : (
        <>
          <div className="card doc-bar">
            <div>
              <strong>{doc.fileName}</strong>
              <div className="muted">
                {doc.pages} pages · {doc.totalChunks} chunks
              </div>
            </div>

            <div className="doc-actions">
              <button onClick={() => setDoc(null)}>New PDF</button>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <Chat key={doc.documentId} documentId={doc.documentId} />
        </>
      )}
    </div>
  );
}