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

const getUserAccountsController = asyncHandler(async(req, res)=>{
    
    const accounts = await AccountModel.find({user: req.user._id});

    res.status(200)
    .json(new ApiResponse(200,accounts ))
});
const getUserBalanceController = asyncHandler(async(req, res)=>{
    
    const {accountId}= req.params;
    const account = await AccountModel.findOne({
        _id:accountId,
        user:req.user._id
    })

    if(!account){
        return res.status(404)
        .json({
            message:"account not found"
        })
    }

    const balance = await account.getBalance();
    res.status(200).json({
        accountId:account._id,
        balance: balance
    });

});





export {accountController,getUserAccountsController,getUserBalanceController};
