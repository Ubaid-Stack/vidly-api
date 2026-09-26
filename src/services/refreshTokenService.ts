import RefreshToken from "../models/refreshTokenModel.js";

import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

import {
  hashRefreshToken,
  generateRefreshTokenId,
} from "../utils/refreshToken.js";

const refreshTokenService = async (refreshToken: string) => {
  const payload = await verifyRefreshToken(refreshToken);

  const userId = payload.userId as string;

  const tokenHash = await hashRefreshToken(refreshToken);

  const storedToken = await RefreshToken.findOne({
    hashedToken: tokenHash,
    userId,
  });

  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  await RefreshToken.deleteOne({
    _id: storedToken._id,
  });

  const accessToken = await createAccessToken(userId);

  const newTokenId = await generateRefreshTokenId();

  const newRefreshToken = await createRefreshToken(userId, newTokenId);

  const newTokenHash = await hashRefreshToken(newRefreshToken);

  await RefreshToken.create({
    userId,
    hashedToken: newTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    tokenId: newTokenId,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export default refreshTokenService;
