import app from "./app.js";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";
import registerProcessHandlers from "./utils/processHandlers.js";

registerProcessHandlers();

const startServer = async () => {
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

startServer();
