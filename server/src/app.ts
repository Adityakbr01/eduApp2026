import express from "express";
import { httpLogger } from "./utils/httpLogger.js";
import { globalErrorHandler } from "./middlewares/system/globalErrorHandler.js";
import { notFoundHandler } from "./middlewares/system/notFound.js";
import links from "./links/index.js";
import rootRoute from "./links/root.route.js";
import { applyMiddlewares } from "./middlewares/system/index.js";

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
applyMiddlewares(app);
app.use(httpLogger);

/* ---------------- links ---------------- */
// Mount all versioned links
app.use("/", rootRoute);
app.use(links);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
