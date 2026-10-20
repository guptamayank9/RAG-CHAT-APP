import React, { useState } from 'react'
import UploadBox from './components/UploadBox';
import Chat from './components/Chat';


const App = () => {
  const [doc, setDoc] = useState(null);

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
            <button onClick={() => setDoc(null)}>New PDF</button>
          </div>

          <Chat key={doc.documentId} documentId={doc.documentId} />
        </>
      )}
    </div>
  );
}

export default App
