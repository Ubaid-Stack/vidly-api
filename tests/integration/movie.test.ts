import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import connectDB from "../../src/config/db.js";
import { env } from "../../src/config/env.js";
import Movie from "../../src/models/movieModel.js";
import User from "../../src/models/userModel.js";
import { hashPassword } from "../../src/utils/password.js";

const adminEmail = "movie-admin@example.com";
const userEmail = "movie-user@example.com";
const adminAgent = request.agent(app);
const userAgent = request.agent(app);

const validMovie = {
  title: "The Matrix",
  genre: { name: "Science Fiction" },
  numberInStock: 5,
  dailyRentalRate: 12,
};

beforeAll(async () => {
  await connectDB(env.MONGO_URI);

  const passwordHash = await hashPassword("password123");

  await User.deleteMany({ email: { $in: [adminEmail, userEmail] } });
  await User.create([
    {
      username: "movie-admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
    {
      username: "movie-user",
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
  await Movie.deleteMany({});
});

afterAll(async () => {
  await Movie.deleteMany({});
  await User.deleteMany({ email: { $in: [adminEmail, userEmail] } });
  await mongoose.connection.close();
});

describe("Movie API", () => {
  describe("GET /api/movies", () => {
    it("should return an empty list when there are no movies", async () => {
      const response = await request(app).get("/api/movies");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should return movies with their stored data", async () => {
      const movies = await Movie.create([
        validMovie,
        {
          ...validMovie,
          title: "Inception",
          genre: { name: "Thriller" },
          numberInStock: 10,
          dailyRentalRate: 15,
        },
      ]);

      const response = await request(app).get("/api/movies");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining(
          movies.map((movie) =>
            expect.objectContaining({
              _id: movie._id.toString(),
              title: movie.title,
              genre: expect.objectContaining({ name: movie.genre.name }),
              numberInStock: movie.numberInStock,
              dailyRentalRate: movie.dailyRentalRate,
            }),
          ),
        ),
      );
    });
  });

  describe("POST /api/movies", () => {
    it("should require authentication", async () => {
      const response = await request(app).post("/api/movies").send(validMovie);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Authentication required" });
    });

    it("should reject a non-admin user", async () => {
      const response = await userAgent.post("/api/movies").send(validMovie);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Forbidden" });
    });

    it("should reject invalid movie data", async () => {
      const response = await adminAgent.post("/api/movies").send({
        title: "AB",
        genre: { name: "X" },
        numberInStock: -1,
        dailyRentalRate: 1001,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed.");
    });

    it("should create a movie for an admin", async () => {
      const response = await adminAgent.post("/api/movies").send(validMovie);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          title: validMovie.title,
          genre: expect.objectContaining({ name: validMovie.genre.name }),
          numberInStock: validMovie.numberInStock,
          dailyRentalRate: validMovie.dailyRentalRate,
        }),
      );
    });
  });

  describe("GET /api/movies/:id", () => {
    it("should return a movie by id", async () => {
      const movie = await Movie.create(validMovie);

      const response = await request(app).get(`/api/movies/${movie._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: movie._id.toString(),
          title: validMovie.title,
          genre: expect.objectContaining({ name: validMovie.genre.name }),
        }),
      );
    });

    it("should reject an invalid id", async () => {
      const response = await request(app).get("/api/movies/not-an-id");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid Movie ID." });
    });

    it("should return 404 when the movie does not exist", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/movies/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Movie not found" });
    });
  });

  describe("PATCH /api/movies/:id", () => {
    it("should update a movie for an admin", async () => {
      const movie = await Movie.create(validMovie);

      const response = await adminAgent
        .patch(`/api/movies/${movie._id}`)
        .send({ numberInStock: 20, dailyRentalRate: 18 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: movie._id.toString(),
          title: validMovie.title,
          numberInStock: 20,
          dailyRentalRate: 18,
        }),
      );
    });

    it("should reject an empty update", async () => {
      const movie = await Movie.create(validMovie);

      const response = await adminAgent
        .patch(`/api/movies/${movie._id}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed.");
    });

    it("should reject a non-admin user", async () => {
      const movie = await Movie.create(validMovie);

      const response = await userAgent
        .patch(`/api/movies/${movie._id}`)
        .send({ title: "Changed title" });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Forbidden" });
    });

    it("should return 404 when updating a missing movie", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await adminAgent
        .patch(`/api/movies/${id}`)
        .send({ title: "Changed title" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Movie with the given ID was not found.",
      });
    });
  });

  describe("DELETE /api/movies/:id", () => {
    it("should delete a movie for an admin", async () => {
      const movie = await Movie.create(validMovie);

      const response = await adminAgent.delete(`/api/movies/${movie._id}`);

      expect(response.status).toBe(204);
      expect(await Movie.findById(movie._id)).toBeNull();
    });

    it("should return 404 when deleting a missing movie", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await adminAgent.delete(`/api/movies/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Movie with the given ID was not found.",
      });
    });
  });
});
