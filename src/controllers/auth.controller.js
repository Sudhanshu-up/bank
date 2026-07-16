import { UserModel } from "../models/user.model.js";
import asyncHandler from "../utils/async_handler.js"
import ApiError from "../utils/api_error.js";
import ApiResponse from "../utils/api_response.js";
import jwt from "jsonwebtoken";
import {sendRegistrationEmail} from "../services/email.service.js";
import { TokenBlackListModel } from "../models/blacklist.model.js";

const userRegister = asyncHandler(async(req, res)=>{
    

    // extracting the data from the request body
    const {email, name, password} = req.body;
    
    // validate the user field in not empty
    if([ email,  name, password].some((field)=>
        field.trim()==="")
    ){
        throw new ApiError(400,"field is required")

    };

    // check if the user already exists in the database
    const existingUser = await UserModel.findOne({
        $or:[{email}]
    });

    if(existingUser){
        throw new ApiError(400,"User already exists with this email")

    };


    // create a new user in the database
    const user = await UserModel.create({
        name,
        email,
        password
    });

   // fetch the created user from the database without the password field
    const createdUser = await UserModel.findById(user._id)
    .select("-password");

    // check if the user is not cretated in the database
    if(!createdUser){
        throw new ApiError(500,"User not created")
    }

    // generate a jwt token for the user
    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"3d"})

    // set the token in the cookie
    res.cookie("token",token)


    // send the response to the client
    res.status(201).json(
        new ApiResponse(201,
            "User created successfully",
            { user: createdUser, token }
        )
    );


    await sendRegistrationEmail(user.email, user.name);


});



const userlogin = asyncHandler(async(req,res)=>{
    // extracting the data from the request body
    const {email, name, password} = req.body;
    
    if(!email){
        throw new ApiError(400,"Email is required");
    }
    // check if the password is provided
    if(!password){
        throw new ApiError(400,"Password is required");
    }
    const user = await UserModel.findOne({
        $or:[{email}]}).select("+password");
    // check if the user exists in the database
    if(!user){
        throw new ApiError(404,"User not found with this email");
    };
    // check if the password is valid
    const isPasswordValid = await user.comparePassword(password);
    // check if the password is valid
    if(!isPasswordValid){
        throw new ApiError(400,"Invalid password");
    };
    // fetch the user from the database without the password field
    const loggedInUser = await UserModel.findById(user._id).select("-password");

    // generate a jwt token for the user
    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"3d"})

    // set the token in the cookie
    res.cookie("token",token)


    // send the response to the client
    res.status(200).json(
        new ApiResponse(200,
            "User logged in successfully",
            { user: loggedInUser, token }
        )
    );
    
})

const userLogout= asyncHandler(async(req, res)=> {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if (!token) {
        return res.status(200).json({
            message: "User logged out successfully"
        })
    }



    await TokenBlackListModel.create({
        token: token
    })

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })

});


export {userRegister, userlogin,userLogout};