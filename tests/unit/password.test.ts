import { hashPassword, verifyPassword } from "../../src/utils/password.js";
import { describe, expect, it } from "vitest";

describe("Password Utilities", () => {
  it("should hash a password", async () => {
    const password = "myPassword123";
    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).not.toBe(password);
  });

  it("should verify the original password and reject a different password", async () => {
    const hashedPassword = await hashPassword("myPassword123");

    await expect(verifyPassword("myPassword123", hashedPassword)).resolves.toBe(
      true,
    );
    await expect(verifyPassword("wrongPassword", hashedPassword)).resolves.toBe(
      false,
    );
  });
});
