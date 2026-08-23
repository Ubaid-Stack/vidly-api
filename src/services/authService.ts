import type { LoginInput } from "../schema/authSchema.js";

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

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
  };
};

export { loginUser };