import { Router } from "express";
import userRouter from "./user.route.js";
import userPreferenceRouter from "./userPreference.route.js";

const router = Router();

router.use("/", userRouter);
router.use("/preferences", userPreferenceRouter);

export default router;
