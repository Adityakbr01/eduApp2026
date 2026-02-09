import { Router } from "express";
import categoryRouter from "./category.route.js";

const router = Router();

router.use("/", categoryRouter);

export default router;
