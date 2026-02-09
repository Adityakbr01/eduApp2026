import { Router } from "express";
import aiRouter from "./ai.route.js";

const router = Router();

router.use("/", aiRouter);

export default router;
