import express from "express";
import { httpLogger } from "./utils/httpLogger.js";
import { globalErrorHandler } from "./middlewares/system/globalErrorHandler.js";
import { notFoundHandler } from "./middlewares/system/notFound.js";
import links from "./routes/index.js";
import rootRoute from "./routes/root.route.js";
import { applyMiddlewares } from "./middlewares/system/index.js";

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
applyMiddlewares(app);
app.use(httpLogger);

// Monitoring Middleware (should be early to capture all requests)
import { monitorMiddleware } from "./middlewares/monitorMiddleware.js";
app.use(monitorMiddleware("edu-app-server"));

// Monitoring Routes
import monitoringRoutes from "./routes/system/monitoring.route.js";
app.use("/api/v1/monitoring", monitoringRoutes);

/* ---------------- links ---------------- */
// Mount all versioned links
app.use("/", rootRoute);
app.use(links);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
