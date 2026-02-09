import { Router } from "express";
import uploadRouter from "./upload.route.js";

const router = Router();

router.use("/", uploadRouter);

export default router;
