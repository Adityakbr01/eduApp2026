import express from "express";
import { API_PREFIX } from "src/constants/api.js";
import healthRouter from "./health.route.js";
import authRouter from "./auth.route.js"
import userRouter from "./user.route.js";
import categoryRouter from "./category.route.js";
// import { env } from "src/configs/env.js";
const router = express.Router();
router.use(`${API_PREFIX}/health`, healthRouter);
router.use(`${API_PREFIX}/auth`, authRouter)
router.use(`${API_PREFIX}/users`, userRouter)
router.use(`${API_PREFIX}/categories`, categoryRouter)

export default router;
