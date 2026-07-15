import app from "./app.js"
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT,()=>{
        console.log(`Serever is running on : ${PORT}`)
    });

};

startServer();


    
