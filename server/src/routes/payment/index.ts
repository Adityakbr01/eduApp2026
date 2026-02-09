import { Router } from "express";
import paymentRouter from "./payment.route.js";

const router = Router();

router.use("/", paymentRouter);

export default router;
