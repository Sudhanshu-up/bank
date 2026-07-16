import mongoose from "mongoose"


const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"AccountModel",
        required:[true,"ledger must be associated with an account"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating a ledger entry"],
        immutable:true,
    
    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"TransactionModel",
        required:[true,"Ledger must be associated with a Transaction"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT", "DEBIT"],
            message: "TYPE can be either CREDIT or DEBIT",
        },
        required:true,
        immutable:true
    }
})


function preventLedgerModification(){
    throw new Error("Ledger entries are Immutable and cannot be modified or deleted")
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updatemany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);


export const LedgerModel = mongoose.model("LedgerModel",ledgerSchema)

