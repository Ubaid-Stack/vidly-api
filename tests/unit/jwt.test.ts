import { describe, expect, it } from "vitest";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../src/utils/jwt.js";

describe("JWT utilities", () => {
  it("should create and verify an access token", async () => {
    const token = await createAccessToken("user-123");
    const payload = await verifyAccessToken(token);

    expect(payload.userId).toBe("user-123");
    expect(payload.type).toBe("access");
    expect(payload.aud).toBe("my-api");
  });

  it("should create and verify a refresh token", async () => {
    const token = await createRefreshToken("user-123", "token-456");
    const payload = await verifyRefreshToken(token);

    expect(payload.userId).toBe("user-123");
    expect(payload.tokenId).toBe("token-456");
    expect(payload.type).toBe("refresh");
  });

  it("should reject an access token as a refresh token", async () => {
    const accessToken = await createAccessToken("user-123");

    await expect(verifyRefreshToken(accessToken)).rejects.toThrow();
  });

  it("should reject a modified token", async () => {
    const token = await createAccessToken("user-123");
    const modifiedToken = `${token}modified`;

    await expect(verifyAccessToken(modifiedToken)).rejects.toThrow();
  });
});
