import mongoose from "mongoose";
import dns from "dns";

const connectDB = async()=>{
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`monogoDB Connected :${connection.connection.host}`)
    } catch (error) {
        console.log(`mongoDB connection failed : ${error.message}`)
        process.exit(1);
    }
};


export default connectDB;