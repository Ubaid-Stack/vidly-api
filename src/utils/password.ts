import argon2 from "argon2";

const hashPassword = async (password: string) => {
  return argon2.hash(password);
};

const verifyPassword = async (password: string, passwordHash: string) => {
  return argon2.verify(passwordHash, password);
};

export { hashPassword, verifyPassword };
