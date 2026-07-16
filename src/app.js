import express from "express"
import cors from "cors"
// import ApiResponse from "./utils/api_response.js"
import ApiError from "./utils/api_error.js"
import errorHandler from "./middlewares/error.middleware.js"
import authRouter from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import accountRouter from "./routes/account.route.js"
import transectionRouter from "./routes/transaction.route.js"


const app = express();


app.use(express.json());
app.use(cors());
app.use(cookieParser());


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/auth", accountRouter);
app.use("/api/v1/auth",transectionRouter)


app.use((req,res,next)=>{
    next(new ApiError(404, `Route ${req.originalUrl} not found`))

});


app.use(errorHandler);

export default app;