import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import connectDB from "../../src/config/db.js";
import { env } from "../../src/config/env.js";
import Genre from "../../src/models/genreModel.js";
import User from "../../src/models/userModel.js";
import { hashPassword } from "../../src/utils/password.js";

const adminEmail = "genre-admin@example.com";
const userEmail = "genre-user@example.com";
const adminAgent = request.agent(app);
const userAgent = request.agent(app);

beforeAll(async () => {
  await connectDB(env.MONGO_URI);

  const passwordHash = await hashPassword("password123");

  await User.deleteMany({ email: { $in: [adminEmail, userEmail] } });
  await User.create([
    {
      username: "genre-admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
    {
      username: "genre-user",
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
  await Genre.deleteMany({});
});

afterAll(async () => {
  await Genre.deleteMany({});
  await User.deleteMany({ email: { $in: [adminEmail, userEmail] } });
  await mongoose.connection.close();
});

describe("Genre API", () => {
  describe("GET /api/genres", () => {
    it("should return a list of genres", async () => {
      const response = await request(app).get("/api/genres");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should return a list of genres with data", async () => {
      const genres = await Genre.create([
        { name: "Action" },
        { name: "Comedy" },
      ]);

      const response = await request(app).get("/api/genres");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining(
          genres.map((genre) =>
            expect.objectContaining({
              _id: genre._id.toString(),
              name: genre.name,
            }),
          ),
        ),
      );
    });
  });

  describe("POST /api/genres", () => {
    it("should require authentication", async () => {
      const response = await request(app)
        .post("/api/genres")
        .send({ name: "Action" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Authentication required" });
    });

    it("should reject a non-admin user", async () => {
      const response = await userAgent
        .post("/api/genres")
        .send({ name: "Action" });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Forbidden" });
    });

    it("should validate the genre name", async () => {
      const response = await adminAgent
        .post("/api/genres")
        .send({ name: "AB" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed.");
    });

    it("should create a genre for an admin", async () => {
      const response = await adminAgent
        .post("/api/genres")
        .send({ name: "Action" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          name: "Action",
        }),
      );
    });
  });

  describe("GET /api/genres/:id", () => {
    it("should return a genre by id", async () => {
      const genre = await Genre.create({ name: "Action" });

      const response = await adminAgent.get(`/api/genres/${genre._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: genre._id.toString(),
          name: "Action",
        }),
      );
    });

    it("should reject an invalid id", async () => {
      const response = await adminAgent.get("/api/genres/not-an-id");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid Genre ID." });
    });

    it("should return 404 when the genre does not exist", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await adminAgent.get(`/api/genres/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Genre with the given ID was not found.",
      });
    });
  });

  describe("PATCH /api/genres/:id", () => {
    it("should update a genre", async () => {
      const genre = await Genre.create({ name: "Action" });

      const response = await adminAgent
        .patch(`/api/genres/${genre._id}`)
        .send({ name: "Adventure" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: genre._id.toString(),
          name: "Adventure",
        }),
      );
    });

    it("should reject an empty update", async () => {
      const genre = await Genre.create({ name: "Action" });

      const response = await adminAgent
        .patch(`/api/genres/${genre._id}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed.");
    });

    it("should return 404 when updating a missing genre", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await adminAgent
        .patch(`/api/genres/${id}`)
        .send({ name: "Adventure" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Genre with the given ID was not found.",
      );
    });
  });

  describe("DELETE /api/genres/:id", () => {
    it("should delete a genre", async () => {
      const genre = await Genre.create({ name: "Action" });

      const response = await adminAgent.delete(`/api/genres/${genre._id}`);

      expect(response.status).toBe(204);
      expect(await Genre.findById(genre._id)).toBeNull();
    });

    it("should return 404 when deleting a missing genre", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await adminAgent.delete(`/api/genres/${id}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Genre with the given ID was not found.",
      );
    });
  });
});
