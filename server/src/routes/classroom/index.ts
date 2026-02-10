import { Router } from "express";
import classroomRouter from "./classroom.route.js";

const router = Router();

router.use("/", classroomRouter);

export default router;
