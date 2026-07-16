import mongoose from "mongoose"


const  transactionSchema = new mongoose.Schema({
    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"AccountModel",
        required:[true,"Transaction must be associated with a from-Account"],
        index:true
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"AccountModel",
        required:[true,"Transaction must be associated with a To-Account"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message:"Status can be either PENDING, COMPLETE, FAILED or REVERSED"
        },
        default:"PANDING"
    },
    amount:{
        type:Number,
        required:[true, "amount is required for creating a transaction"],
        min:[0, "Transaction amount cannot be negative"]
    },
    idempotencyKey:{
        type:String,
        required:[true,"Idempotency key is required for creating a transaction"],
        index:true,
        unique:true
    }
},{timestamps:true})


export const TransactionModel = mongoose.model("TransactionModel",transactionSchema)