import crypto from "node:crypto";

export const generateRefreshTokenId = () => {
  return crypto.randomUUID();
};

export const hashRefreshToken = (refreshToken: string) => {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
};
