import React, { useState } from 'react'
import axios from 'axios';


const UploadBox = ( {onUploaded}) => {

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpload = async () => {

        if(!file) return;
        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setError("");

        try {
            const {data} = await axios.post('/api/upload', formData);
            onUploaded(data);  
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Upload failed");
        }finally{
            setLoading(false);
        }
        
    };

  return (

    <div className='card'>
        <h2>Upload your PDF</h2>

        <input type="file"
        accept='.pdf'
        onChange={(e)=> setFile(e.target.files[0])}
        />

        <div style={{marginTop: 16}}>
            <button onClick={handleUpload} disabled={!file || loading}>
                {loading ? "Processing..." : "Upload"}

            </button>
        </div>
        {
            loading && (
            <p className='muted'>
                Reading, chunking and embedding your PDF. This can take 10-30 seconds.

            </p>     
        )}
        
        {error && <p className='error'>{error}</p>}
      
    </div>
  )
}

export default UploadBox
