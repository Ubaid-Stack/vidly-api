import RefreshToken from "../models/refreshTokenModel.js";
import type { LoginInput } from "../schema/authSchema.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

import { verifyPassword } from "../utils/password.js";
import {
  generateRefreshTokenId,
  hashRefreshToken,
} from "../utils/refreshToken.js";

import { getUserByEmailWithPasswordService } from "./userService.js";

export const loginUser = async (data: LoginInput) => {
  const user = await getUserByEmailWithPasswordService(data.email);

  if (!user) {
    return null;
  }

  const isPasswordValid = await verifyPassword(
    data.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    return null;
  }

  const accessToken = await createAccessToken(user._id.toString());

  const tokenId = await generateRefreshTokenId();

  const refreshToken = await createRefreshToken(
    user._id.toString(),
    accessToken,
  );

  const hashedRefreshToken = await hashRefreshToken(refreshToken);

  await RefreshToken.create({
    userId: user._id.toString(),
    tokenId,
    hashedToken: hashedRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const logoutUser = async (refreshToken: string) => {
  const payload = await verifyRefreshToken(refreshToken);

  const userId = payload.userId as string;

  const hashedToken = await hashRefreshToken(refreshToken);

  await RefreshToken.deleteOne({
    hashedToken,
    userId,
  });
};
