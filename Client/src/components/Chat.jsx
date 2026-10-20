import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios';



const Chat = ({documentId}) => {

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);


     // naya message aaye to neeche scroll ho jaye
     useEffect(()=>{
        bottomRef?.current?.scrollIntoView({behavior: "smooth"});
     },[messages, loading]);

     const sendMessages = async () => {
        const question = input.trim();
        if(!question || loading) return;

        setMessages((prev)=>[...prev, {role:'user', text:question}]);
        setInput("");
        setLoading(true);

        try {
            const {data} = await axios.post('/api/chat',{
                question, documentId
            });
            setMessages((prev)=>[
                ...prev,
                {
                    role:'assistant',
                    text:data.answer,
                    sources:data.sources
                },
            ]);
            
        } catch (err) {
            setMessages((prev)=>[
                ...prev,
                {
                    role: 'assistant',
                    text:err.response?.data?.error || "Something went wrong",
                    isError:true,
                },
            ]);
            
        }finally{
            setLoading(false);
        }
        
     }
     const handleKeyDown = (e) =>{
        if(e.key === 'Enter' && !e.shiftKey){
            e.preventDefault();
            sendMessages();
        }
     };
  return (
    <div className='card chat'>
        <div className='messages'>
            {messages.length === 0 && (
                <p className='muted'>
                    Ask anything about your document. Answers come with the exact
            sources used.
                </p>
            )}

            {messages.map((m,i)=>(
                <div key={i} className={`message ${m.role}`}>
                    <div className={`bubble ${m.isError ? 'bubble-error' : ""}`}
                    >{m.text}</div>

                    {m.sources && m.sources.length > 0 && (
                        <details className='sources'>
                            <summary>Sources ({m.sources.length})</summary>

                            {m.sources.map((s,j)=>(
                                <div key={j} className='source'>
                                    <strong>
                                        Chunk #{s.chunkIndex + 1} · {Math.round(s.score * 100)}% match
                                    </strong>
                                <p>{s.preview}...</p>
                                </div>
                            ))}
                        </details>
                    )}

                </div>
            ))}

        {loading && (
          <div className="message assistant">
            <div className="bubble muted">Thinking...</div>
          </div>
        )}

        <div ref={bottomRef} />
        </div>
       <div className="input-row">
        <textarea
          rows={2}
          placeholder="Ask a question about your PDF..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessages} disabled={!input.trim() || loading}>
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat
