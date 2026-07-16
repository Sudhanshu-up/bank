import mongoose from "mongoose"
import { LedgerModel } from "./ledger.model.js";

const userAccountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"userModel",
        required:[true, "account must be associated with a user"],
        index:true   //for fast searching
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE", "FROZEN", "CLOSED"],
            message:"Status can be either ACTIVE, FROZEN OR CLOSED",
        },default:"ACTIVE"
    },
    currency:{
        type:String,
        required:[true, "currency is required for creatting an account"],
        default:"INR"
    }
},{timestamps:true})



userAccountSchema.index({user:1, status:1}); //compound index

userAccountSchema.methods.getBalance = async function(){

    const balanceData = await LedgerModel.aggregate([
        {$match: {account : this._id}},
        {
            $group:{
                _id:null,
                totalDebit:{
                    $sum:{
                        $cond:[
                            {$eq:["$type","DEBIT"]},
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit:{
                    $sum:{
                        $cond:[
                            {$eq:["$type","CREDIT"]},
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },{
            $project: {
                _id:0,
                balance : {$subtract: ["$totalCredit","$totalDebit"]}
            }
        }
    ])

    if(balanceData.length === 0){
        return 0
    }
    return balanceData[0].balance

}

export const AccountModel = mongoose.model("AccountModel",userAccountSchema);