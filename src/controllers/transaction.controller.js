import { TransactionModel } from "../models/transaction.model.js";

import { LedgerModel } from "../models/ledger.model.js";
import {AccountModel} from "../models/account.model.js"

import ApiError from "../utils/api_error.js";
import ApiResponse from "../utils/api_response.js";
import asyncHandler from "../utils/async_handler.js";
import {sendTransactionSuccessEmail} from "../services/email.service.js"
import {sendTransactionFailureEmail} from "../services/email.service.js"
import mongoose from "mongoose";

/**
 * Create a new transaction 
 * the 10 step transaction flow 
 * 1 validate request 
 * 2 validate idempontency key 
 * 3 check account status 
 * 4 derive sender balnce from ledger 
 * 5 create transaction (PENDING)
 * 6 create debit ledger entry
 * 7 create credit ledger
 * 8 mark transaction complete 
 * 9 commit mongoDB session
 * 10 send email notification
 */


const createTransaction = asyncHandler(async(req, res)=>{

    const {fromAccount, toAccount, amount, idempotencyKey } = req.body

//1

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        throw new ApiError(400,
            "FromAccount, Toaccount, Amount and IdempotencyKey is Required !"
        )
    }

    const fromUserAccount = await AccountModel.findOne({
         $or:[{_id:fromAccount}]
    })

    if(!fromUserAccount){
        throw new ApiError(400," ! Not found the FromAccount")
    }

     const toUserAccount = await AccountModel.findOne({
         $or:[{_id:toAccount}]
    })

    if(!toUserAccount){
        throw new ApiError(400," ! Not found the ToAccount")
    };

    //2

    const isTransactionAlreadyExists = await TransactionModel.findOne({
        $or:[{idempotencyKey:idempotencyKey}]
    })

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200)
            .json(new ApiResponse(200,
                "transaction is Successfully Copmpleted !",
                isTransactionAlreadyExists
            ))
        }
        
        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(205)    
            .json(new ApiResponse(205,
                "transaction is still processing !",
            ))
        }

        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(501)     
            .json(new ApiResponse(501,
                "transaction is Failed !",
            ))
        }
        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(505)
            .json(new ApiResponse(505,
                "transaction was reversed ,please try again!",
            ))
        }
    }


    //3

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400)
        .json(new ApiResponse(
            400,"both fromAccount and to Account must be Active to Process transation"
        ))
    }


 //4
    const balance = await fromUserAccount.getBalance()

    if(balance< amount){
        return res.status(400)
        .json(new ApiResponse(400,
            `Insuffcient balance current balance is ${balance}, requested amount is ${amount}`
        ))
    }

    //5

    let transaction;
    try {


        /**
         * 5. Create transaction (PENDING)
         */
        const session = await mongoose.startSession()
        session.startTransaction()

        transaction = (await TransactionModel.create([ {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        } ], { session }))[ 0 ]

        const debitLedgerEntry = await LedgerModel.create([ {
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        } ], { session })

        await (() => {
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
        })()

        const creditLedgerEntry = await LedgerModel.create([ {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        } ], { session })

        await TransactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )


        await session.commitTransaction()
        session.endSession()
    } catch (error) {

        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })

    }
    /**
     * 10. Send email notification
     */
    await sendTransactionSuccessEmail(req.user.email, req.user.name, amount, toAccount)

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })



});
const createInitialFundsTransaction = asyncHandler(async(req,res)=>{
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await AccountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await AccountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new TransactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await LedgerModel.create([ {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    } ], { session })

    const creditLedgerEntry = await LedgerModel.create([ {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    } ], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })



})

export {createTransaction,createInitialFundsTransaction};