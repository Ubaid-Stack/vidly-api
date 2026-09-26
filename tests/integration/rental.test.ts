import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import connectDB from "../../src/config/db.js";
import { env } from "../../src/config/env.js";
import Customer from "../../src/models/customerModel.js";
import Movie from "../../src/models/movieModel.js";
import Rental from "../../src/models/rentalModel.js";
import User from "../../src/models/userModel.js";
import { hashPassword } from "../../src/utils/password.js";

const adminEmail = "rental-admin@example.com";
const userEmail = "rental-user@example.com";
const adminAgent = request.agent(app);
const userAgent = request.agent(app);

const customerData = { name: "John Doe", phone: "123456789" };
const movieData = {
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
      username: "rental-admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
    {
      username: "rental-user",
      email: userEmail,
      passwordHash,
      role: "user",
    },
  ]);

  const [adminLogin, userLogin] = await Promise.all([
    adminAgent
      .post("/api/auth/login")
      .send({ email: adminEmail, password: "password123" }),
    userAgent
      .post("/api/auth/login")
      .send({ email: userEmail, password: "password123" }),
  ]);

  expect(adminLogin.status).toBe(200);
  expect(userLogin.status).toBe(200);
});

beforeEach(async () => {
  await Rental.deleteMany({});
  await Customer.deleteMany({});
  await Movie.deleteMany({});
});

afterAll(async () => {
  await Rental.deleteMany({});
  await Customer.deleteMany({});
  await Movie.deleteMany({});
  await User.deleteMany({ email: { $in: [adminEmail, userEmail] } });
  await mongoose.connection.close();
});

const createDependencies = async () => {
  const customer = await Customer.create(customerData);
  const movie = await Movie.create(movieData);
  return { customer, movie };
};

describe("Rental API", () => {
  describe("GET /api/rentals", () => {
    it("should return an empty list", async () => {
      const response = await request(app).get("/api/rentals");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should return stored rentals", async () => {
      const { customer, movie } = await createDependencies();
      const rental = await Rental.create({
        customer: customer._id,
        movie: movie._id,
        rentalFee: 12,
      });

      const response = await request(app).get("/api/rentals");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        expect.objectContaining({
          _id: rental._id.toString(),
          customer: customer._id.toString(),
          movie: movie._id.toString(),
          rentalFee: 12,
        }),
      ]);
    });
  });

  describe("POST /api/rentals", () => {
    it("should require authentication", async () => {
      const response = await request(app).post("/api/rentals").send({});

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Authentication required" });
    });

    it("should reject a non-admin user", async () => {
      const response = await userAgent.post("/api/rentals").send({});

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Forbidden" });
    });

    it("should reject invalid ObjectIds", async () => {
      const response = await adminAgent.post("/api/rentals").send({
        customer: "not-an-id",
        movie: "not-an-id",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed.");
    });

    it("should return 404 when the customer or movie is missing", async () => {
      const { movie } = await createDependencies();
      const missingCustomerId = new mongoose.Types.ObjectId();

      const response = await adminAgent.post("/api/rentals").send({
        customer: missingCustomerId.toString(),
        movie: movie._id.toString(),
      });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Customer not found." });
    });

    it("should create a rental with the movie rental fee", async () => {
      const { customer, movie } = await createDependencies();

      const response = await adminAgent.post("/api/rentals").send({
        customer: customer._id.toString(),
        movie: movie._id.toString(),
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          customer: customer._id.toString(),
          movie: movie._id.toString(),
          rentalFee: 12,
        }),
      );
    });
  });

  describe("GET /api/rentals/:id", () => {
    it("should return a rental by id", async () => {
      const { customer, movie } = await createDependencies();
      const rental = await Rental.create({
        customer: customer._id,
        movie: movie._id,
        rentalFee: 12,
      });

      const response = await adminAgent.get(`/api/rentals/${rental._id}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(rental._id.toString());
    });

    it("should reject an invalid id", async () => {
      const response = await adminAgent.get("/api/rentals/not-an-id");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid Rental ID." });
    });

    it("should return 404 for a missing rental", async () => {
      const id = new mongoose.Types.ObjectId();
      const response = await adminAgent.get(`/api/rentals/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Rental not found." });
    });
  });

  describe("PUT /api/rentals/:id", () => {
    it("should update the return date", async () => {
      const { customer, movie } = await createDependencies();
      const rental = await Rental.create({
        customer: customer._id,
        movie: movie._id,
        rentalFee: 12,
      });
      const dateReturned = "2026-09-26T12:00:00.000Z";

      const response = await adminAgent
        .put(`/api/rentals/${rental._id}`)
        .send({ dateReturned });

      expect(response.status).toBe(200);
      expect(new Date(response.body.dateReturned).toISOString()).toBe(
        dateReturned,
      );
    });

    it("should reject invalid update data", async () => {
      const { customer, movie } = await createDependencies();
      const rental = await Rental.create({
        customer: customer._id,
        movie: movie._id,
        rentalFee: 12,
      });

      const response = await adminAgent
        .put(`/api/rentals/${rental._id}`)
        .send({ dateReturned: "not-a-date" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed.");
    });

    it("should return 404 when updating a missing rental", async () => {
      const id = new mongoose.Types.ObjectId();
      const response = await adminAgent
        .put(`/api/rentals/${id}`)
        .send({ dateReturned: "2026-09-26" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Rental with the given ID was not found.",
      );
    });
  });

  describe("DELETE /api/rentals/:id", () => {
    it("should delete a rental", async () => {
      const { customer, movie } = await createDependencies();
      const rental = await Rental.create({
        customer: customer._id,
        movie: movie._id,
        rentalFee: 12,
      });

      const response = await adminAgent.delete(`/api/rentals/${rental._id}`);

      expect(response.status).toBe(204);
      expect(await Rental.findById(rental._id)).toBeNull();
    });

    it("should return 404 when deleting a missing rental", async () => {
      const id = new mongoose.Types.ObjectId();
      const response = await adminAgent.delete(`/api/rentals/${id}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Rental with the given ID was not found.",
      );
    });
  });
});
