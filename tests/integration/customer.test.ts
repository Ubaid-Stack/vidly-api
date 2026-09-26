import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import connectDB from "../../src/config/db.js";
import { env } from "../../src/config/env.js";
import Customer from "../../src/models/customerModel.js";
import User from "../../src/models/userModel.js";
import { hashPassword } from "../../src/utils/password.js";

const adminEmail = "customer-admin@example.com";
const userEmail = "customer-user@example.com";
const adminAgent = request.agent(app);
const userAgent = request.agent(app);

beforeAll(async () => {
  await connectDB(env.MONGO_URI);

  const passwordHash = await hashPassword("password123");

  await User.deleteMany({ email: { $in: [adminEmail, userEmail] } });
  await User.create([
    {
      username: "customer-admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
    {
      username: "customer-user",
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
  await Customer.deleteMany({});
});

afterAll(async () => {
  await Customer.deleteMany({});
  await User.deleteMany({ email: { $in: [adminEmail, userEmail] } });
  await mongoose.connection.close();
});

describe("Customer API", () => {
  describe("GET /api/customer", () => {
    it("should return an empty list when there are no customers", async () => {
      const response = await request(app).get("/api/customer");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should return customers with their stored data", async () => {
      const customers = await Customer.create([
        { name: "John Doe", phone: "123456789", isGold: false },
        { name: "Jane Doe", phone: "987654321", isGold: true },
      ]);

      const response = await request(app).get("/api/customer");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining(
          customers.map((customer) =>
            expect.objectContaining({
              _id: customer._id.toString(),
              name: customer.name,
              phone: customer.phone,
              isGold: customer.isGold,
            }),
          ),
        ),
      );
    });
  });

  describe("POST /api/customer", () => {
    it("should require authentication", async () => {
      const response = await request(app)
        .post("/api/customer")
        .send({ name: "John Doe", phone: "123456789" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Authentication required" });
    });

    it("should reject a non-admin user", async () => {
      const response = await userAgent
        .post("/api/customer")
        .send({ name: "John Doe", phone: "123456789" });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Forbidden" });
    });

    it("should reject invalid customer data", async () => {
      const response = await adminAgent
        .post("/api/customer")
        .send({ name: "Jo", phone: "123" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed.");
    });

    it("should create a customer for an admin", async () => {
      const response = await adminAgent
        .post("/api/customer")
        .send({ name: "John Doe", phone: "123456789" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          name: "John Doe",
          phone: "123456789",
          isGold: false,
        }),
      );
    });
  });

  describe("GET /api/customer/:id", () => {
    it("should return a customer by id", async () => {
      const customer = await Customer.create({
        name: "John Doe",
        phone: "123456789",
      });

      const response = await adminAgent.get(`/api/customer/${customer._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: customer._id.toString(),
          name: "John Doe",
          phone: "123456789",
          isGold: false,
        }),
      );
    });

    it("should reject an invalid id", async () => {
      const response = await adminAgent.get("/api/customer/not-an-id");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid Customer ID." });
    });

    it("should return 404 when the customer does not exist", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await adminAgent.get(`/api/customer/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Customer not found" });
    });
  });

  describe("PATCH /api/customer/:id", () => {
    it("should update a customer", async () => {
      const customer = await Customer.create({
        name: "John Doe",
        phone: "123456789",
      });

      const response = await adminAgent
        .patch(`/api/customer/${customer._id}`)
        .send({ name: "Jane Doe", isGold: true });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: customer._id.toString(),
          name: "Jane Doe",
          phone: "123456789",
          isGold: true,
        }),
      );
    });

    it("should reject an empty update", async () => {
      const customer = await Customer.create({
        name: "John Doe",
        phone: "123456789",
      });

      const response = await adminAgent
        .patch(`/api/customer/${customer._id}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed.");
    });

    it("should return 404 when updating a missing customer", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await adminAgent
        .patch(`/api/customer/${id}`)
        .send({ name: "Jane Doe" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Customer with the given ID was not found.",
      );
    });
  });

  describe("DELETE /api/customer/:id", () => {
    it("should delete a customer", async () => {
      const customer = await Customer.create({
        name: "John Doe",
        phone: "123456789",
      });

      const response = await adminAgent.delete(`/api/customer/${customer._id}`);

      expect(response.status).toBe(204);
      expect(await Customer.findById(customer._id)).toBeNull();
    });

    it("should return 404 when deleting a missing customer", async () => {
      const id = new mongoose.Types.ObjectId();

      const response = await adminAgent.delete(`/api/customer/${id}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Customer with the given ID was not found.",
      );
    });
  });
});
