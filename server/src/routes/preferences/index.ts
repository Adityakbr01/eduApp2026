import { Router } from "express";
import userPreferenceRouter from "./userPreference.route.js";

const router = Router();

router.use("/", userPreferenceRouter);

export default router;
