import { Router } from "express";
import enrollmentRouter from "./enrollment.route.js";

const router = Router();

router.use("/", enrollmentRouter);

export default router;
