require('dotenv').config();
const express = require('express');

const app = express();
const connectdb = require('./config/db');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');


const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


app.get('/api/health', (req, res)=>{
    res.send({
        msg:"Hello from the Server"
    });
});

app.use("/api/upload", uploadRoutes);

const startServer = async () => {
    await connectdb();

    app.listen(PORT, () => {
        console.log('API is working at PORT:', PORT);
    });
};

startServer();