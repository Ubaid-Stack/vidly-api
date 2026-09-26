import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import connectDB from "../../src/config/db.js";
import { env } from "../../src/config/env.js";
import RefreshToken from "../../src/models/refreshTokenModel.js";
import User from "../../src/models/userModel.js";
import { hashPassword } from "../../src/utils/password.js";

const email = "auth-integration@example.com";
const password = "password123";

beforeAll(async () => {
  await connectDB(env.MONGO_URI);
});

beforeEach(async () => {
  await RefreshToken.deleteMany({});
  await User.deleteMany({
    email: { $regex: /^auth-integration@example\.com$/i },
  });
  await User.findOneAndUpdate(
    { email },
    {
      username: "auth-user",
      email,
      passwordHash: await hashPassword(password),
      role: "user",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
});

afterAll(async () => {
  await RefreshToken.deleteMany({});
  await User.deleteMany({
    email: { $regex: /^auth-integration@example\.com$/i },
  });
  await mongoose.connection.close();
});

describe("Auth API", () => {
  describe("POST /api/auth/login", () => {
    it("should reject invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email,
        password: "wrong-password",
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid email or password" });
    });

    it("should validate login input", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "not-an-email",
        password: "",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed.");
    });

    it("should login and set access and refresh cookies", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: email.toUpperCase(),
        password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Login successful" });
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([
          expect.stringContaining("accessToken="),
          expect.stringContaining("refreshToken="),
        ]),
      );
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should require a refresh token", async () => {
      const response = await request(app).post("/api/auth/refresh");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Refresh token required" });
    });

    it("should reject an invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", "refreshToken=invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Invalid or expired refresh token",
      });
    });

    it("should rotate a valid refresh token", async () => {
      const login = await request(app).post("/api/auth/login").send({
        email,
        password,
      });
      const cookies = login.headers["set-cookie"];

      const response = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Access token refreshed" });
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([
          expect.stringContaining("accessToken="),
          expect.stringContaining("refreshToken="),
        ]),
      );
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout and clear the refresh cookie", async () => {
      const login = await request(app).post("/api/auth/login").send({
        email,
        password,
      });

      const response = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", login.headers["set-cookie"]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Logout successful" });
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("refreshToken=")]),
      );
    });
  });
});
