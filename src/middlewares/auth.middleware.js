import { UserModel } from "../models/user.model.js";
import jwt, { decode } from "jsonwebtoken"
import asyncHandler from "../utils/async_handler.js";
import ApiError from "../utils/api_error.js";
import ApiResponse from "../utils/api_response.js";


const authMiddleware = asyncHandler(async(req, res, next)=>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
       return res.status(401)
       .json(new ApiResponse
            ( 401,"Unauthoized access, token is missing !" )
        )
    }


    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
        const user = await UserModel.findById(decoded.userId)
         req.user = user

        return next ()
    } catch (error) {
        throw new ApiError(401,"Unauthorized access token is invalid")
    }

})


const authSystemMiddleware=asyncHandler(async(req, res, next)=>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
       return res.status(401)
       .json(new ApiResponse
            ( 401,"Unauthoized access, token is missing !" )
        )
    }
     try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
        const user = await UserModel.findById(decoded.userId).select("+systemUser")
        if(!user.systemUser){
            return res.status(403).json(
                new ApiResponse(403,"Forbidden access , not a sysytem user")
            )
        }
        req.user= user;
        return next ();
    } catch (error) {
        throw new ApiError(401,"Unauthorized access token is invalid")
    }

})


export {authMiddleware,authSystemMiddleware}


