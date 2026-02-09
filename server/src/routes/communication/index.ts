import { Router } from "express";
import emailCampaignRouter from "./emailCampaign.route.js";

const router = Router();

router.use("/campaigns", emailCampaignRouter);

export default router;
