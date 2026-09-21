import { logger } from "./logger.js";

const registerProcessHandlers = () => {
  process.on("uncaughtException", (error) => {
    logger.error(error, "Uncaught exception");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error(
      reason instanceof Error ? reason : { reason },
      "Unhandled promise rejection",
    );

    process.exit(1);
  });
};

export default registerProcessHandlers;