import { AccountModel } from "../models/account.model.js";
import ApiResponse from "../utils/api_response.js";
import asyncHandler from "../utils/async_handler.js";



const accountController = asyncHandler(async(req, res)=>{
    const user = req.user;

    const account = await AccountModel.create({
        user: user._id
    })

    res.status(201)
    .json(new ApiResponse(201, "Account created successfully !"))
});

export default accountController;
