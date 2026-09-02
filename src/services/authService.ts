import type { LoginInput } from "../schema/authSchema.js";
import { createAccessToken } from "../utils/jwt.js";

import { verifyPassword } from "../utils/password.js";

import { getUserByEmailWithPasswordService } from "./userService.js";

const loginUser = async (data: LoginInput) => {
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

  return {
    accessToken,
  };
};

export default loginUser;
