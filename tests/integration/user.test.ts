import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import connectDB from "../../src/config/db.js";
import { env } from "../../src/config/env.js";
import User from "../../src/models/userModel.js";
import { hashPassword, verifyPassword } from "../../src/utils/password.js";

const adminEmail = "user-admin@example.com";
const userEmail = "user-member@example.com";
const adminAgent = request.agent(app);
const userAgent = request.agent(app);
const createdUserEmail = "user-integration-created@example.com";

beforeAll(async () => {
  await connectDB(env.MONGO_URI);

  const passwordHash = await hashPassword("password123");

  await User.deleteMany({
    email: { $in: [adminEmail, userEmail, createdUserEmail] },
  });
  await User.create([
    {
      username: "user-admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
    {
      username: "user-member",
      email: userEmail,
      passwordHash,
      role: "user",
    },
  ]);

  const [adminLogin, userLogin] = await Promise.all([
    adminAgent.post("/api/auth/login").send({
      email: adminEmail,
      password: "password123",
    }),
    userAgent.post("/api/auth/login").send({
      email: userEmail,
      password: "password123",
    }),
  ]);

  expect(adminLogin.status).toBe(200);
  expect(userLogin.status).toBe(200);
});

beforeEach(async () => {
  await User.deleteMany({ email: /^user-integration-/ });
});

afterAll(async () => {
  await User.deleteMany({
    email: {
      $in: [adminEmail, userEmail, createdUserEmail],
    },
  });
  await User.deleteMany({ email: /^user-integration-/ });
  await mongoose.connection.close();
});

describe("User API", () => {
  describe("GET /api/users", () => {
    it("should require authentication", async () => {
      const response = await request(app).get("/api/users");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Authentication required" });
    });

    it("should return users without password hashes", async () => {
      const response = await userAgent.get("/api/users");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ email: adminEmail, role: "admin" }),
          expect.objectContaining({ email: userEmail, role: "user" }),
        ]),
      );
      expect(
        response.body.every(
          (user: Record<string, unknown>) => !user.passwordHash,
        ),
      ).toBe(true);
    });
  });

  describe("POST /api/users", () => {
    it("should reject a non-admin user", async () => {
      const response = await userAgent.post("/api/users").send({
        username: "new-user",
        email: createdUserEmail,
        password: "password123",
      });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Forbidden" });
    });

    it("should reject invalid user data", async () => {
      const response = await adminAgent.post("/api/users").send({
        username: "ab",
        email: "not-an-email",
        password: "short",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed.");
    });

    it("should create a user without returning the password", async () => {
      const response = await adminAgent.post("/api/users").send({
        username: "new-user",
        email: createdUserEmail,
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          username: "new-user",
          email: createdUserEmail,
          role: "user",
        }),
      );
      expect(response.body.passwordHash).toBeUndefined();

      const storedUser = await User.findOne({ email: createdUserEmail }).select(
        "+passwordHash",
      );
      expect(storedUser).not.toBeNull();
      await expect(
        verifyPassword("password123", storedUser!.passwordHash),
      ).resolves.toBe(true);
    });

    it("should reject a duplicate email", async () => {
      const response = await adminAgent.post("/api/users").send({
        username: "duplicate-user",
        email: userEmail,
        password: "password123",
      });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        message: "User with this email already exists",
      });
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a user by id", async () => {
      const user = await User.findOne({ email: userEmail });

      const response = await userAgent.get(`/api/users/${user!._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: user!._id.toString(),
          email: userEmail,
          username: "user-member",
        }),
      );
      expect(response.body.passwordHash).toBeUndefined();
    });

    it("should reject an invalid id", async () => {
      const response = await userAgent.get("/api/users/not-an-id");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid User ID." });
    });

    it("should return 404 when the user does not exist", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await userAgent.get(`/api/users/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "User not found" });
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should reject a non-admin user", async () => {
      const user = await User.findOne({ email: userEmail });

      const response = await userAgent
        .put(`/api/users/${user!._id}`)
        .send({ username: "changed-name" });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Forbidden" });
    });

    it("should update a user", async () => {
      const user = await User.findOne({ email: userEmail });

      const response = await adminAgent
        .put(`/api/users/${user!._id}`)
        .send({ username: "changed-name", password: "newpassword123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: user!._id.toString(),
          username: "changed-name",
          email: userEmail,
        }),
      );
      expect(response.body.passwordHash).toBeUndefined();

      const updatedUser = await User.findById(user!._id).select(
        "+passwordHash",
      );
      await expect(
        verifyPassword("newpassword123", updatedUser!.passwordHash),
      ).resolves.toBe(true);
    });

    it("should reject an empty update", async () => {
      const user = await User.findOne({ email: userEmail });

      const response = await adminAgent.put(`/api/users/${user!._id}`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed.");
    });

    it("should return 404 when updating a missing user", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await adminAgent
        .put(`/api/users/${id}`)
        .send({ username: "changed-name" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "User not found" });
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete a user for an admin", async () => {
      const user = await User.create({
        username: "user-integration-delete",
        email: "user-integration-delete@example.com",
        passwordHash: await hashPassword("password123"),
      });

      const response = await adminAgent.delete(`/api/users/${user._id}`);

      expect(response.status).toBe(204);
      expect(await User.findById(user._id)).toBeNull();
    });

    it("should return 404 when deleting a missing user", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await adminAgent.delete(`/api/users/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "User not found" });
    });
  });
});
