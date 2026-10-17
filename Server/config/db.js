const mongoose = require('mongoose');

const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGODB CONNECTED : ");
        
    } catch (error) {
        console.log("MongoDB Connection Failed : ",error.message);
        process.exit(1);
        
    }

}
module.exports = connectDB;
