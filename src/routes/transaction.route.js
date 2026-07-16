import express from "express"
import { authMiddleware, authSystemMiddleware } from "../middlewares/auth.middleware.js";
import {createTransaction,createInitialFundsTransaction} from "../controllers/transaction.controller.js"


const router = express.Router()


router.route("/transaction").post(authMiddleware,createTransaction);
router.route("/system/intial-funds").post(authSystemMiddleware,createInitialFundsTransaction)

export default router