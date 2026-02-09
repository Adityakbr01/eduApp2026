import { Router } from "express";
import reviewRouter from "./review.route.js";

const router = Router();

router.use("/", reviewRouter);

export default router;
