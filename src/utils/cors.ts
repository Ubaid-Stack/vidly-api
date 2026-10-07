import cors from "cors";

const corsMiddleware = () => {
  return cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });
};

export default corsMiddleware;
