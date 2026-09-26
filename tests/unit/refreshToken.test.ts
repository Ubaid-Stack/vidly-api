import { describe, expect, it } from "vitest";
import {
  generateRefreshTokenId,
  hashRefreshToken,
} from "../../src/utils/refreshToken.js";

describe("Refresh token utilities", () => {
  it("should return the same SHA-256 hash for the same token", () => {
    const token = "refresh-token";

    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
    expect(hashRefreshToken(token)).toHaveLength(64);
  });

  it("should return different hashes for different tokens", () => {
    expect(hashRefreshToken("token-a")).not.toBe(hashRefreshToken("token-b"));
  });

  it("should generate unique UUID token ids", () => {
    const firstId = generateRefreshTokenId();
    const secondId = generateRefreshTokenId();

    expect(firstId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(secondId).not.toBe(firstId);
  });
});
