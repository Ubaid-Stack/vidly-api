import { SignJWT, jwtVerify } from "jose";
import { env } from "../config/env.js";

const accessTokenSecret = new TextEncoder().encode(env.JWT_SECRET);

const refreshTokenSecret = new TextEncoder().encode(env.REFRESH_TOKEN_SECRET);

export const createAccessToken = async (userId: string) => {
  return new SignJWT({ userId, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .setAudience("my-api")
    .setIssuedAt()
    .sign(accessTokenSecret);
};

export const verifyAccessToken = async (token: string) => {
  const { payload } = await jwtVerify(token, accessTokenSecret, {
    audience: "my-api",
    algorithms: ["HS256"],
  });

  if (payload.type !== "access") {
    throw new Error("Invalid token type");
  }
  return payload;
};

