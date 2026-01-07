import morgan from "morgan";
import { isProd } from "src/configs/env.js";
import logger from "./logger.js";

const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

// Dev format (short + colorful)
const morganDevFormat = ":method :url :status :res[content-length] - :response-time ms";

// Production format (concise)
const morganProdFormat = ":method :url :status - :response-time ms";

export const httpLogger = morgan(
    isProd ? morganProdFormat : morganDevFormat,
    { stream }
);
