import express from "express";
import { httpLogger } from "./utils/httpLogger.js";
import { globalErrorHandler } from "./middlewares/system/globalErrorHandler.js";
import { notFoundHandler } from "./middlewares/system/notFound.js";
import routes from "./routes/index.js";
import rootRoute from "./routes/root.route.js";
import { applyMiddlewares } from "./middlewares/system/index.js";

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
applyMiddlewares(app);
app.use(httpLogger);

/* ---------------- ROUTES ---------------- */
// Mount all versioned routes
app.use("/", rootRoute);
app.use(routes);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
