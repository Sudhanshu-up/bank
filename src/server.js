import app from "./app.js"
import dotenv from "dotenv";


dotenv.config();

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    app.listen(PORT,()=>{
        console.log(`Serever is running on : ${PORT}`)
    });

};

startServer();


    
