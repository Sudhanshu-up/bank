import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {accountController,getUserBalanceController,getUserAccountsController} from "../controllers/account.controller.js";


const router = express.Router();

 router.route("/account").post(authMiddleware,accountController)
 router.route("/allAccount").post(authMiddleware,getUserAccountsController)
 router.route("/balance/:accountId").post(authMiddleware,getUserBalanceController)


export default router;
