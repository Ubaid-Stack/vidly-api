import { describe, expect, it } from "vitest";
import { loginSchema } from "../../src/schema/authSchema.js";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../../src/schema/movieSchema.js";
import { createRentalSchema } from "../../src/schema/rentalSchema.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../../src/schema/userSchema.js";

describe("Request schemas", () => {
  it("should normalize a valid login email", () => {
    const result = loginSchema.safeParse({
      email: "  USER@EXAMPLE.COM ",
      password: "secret",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("should reject unknown login fields and empty passwords", () => {
    expect(
      loginSchema.safeParse({
        email: "user@example.com",
        password: "",
        extra: true,
      }).success,
    ).toBe(false);
  });

  it("should reject an empty user update", () => {
    expect(updateUserSchema.safeParse({}).success).toBe(false);
  });

  it("should reject movie values outside their allowed ranges", () => {
    expect(
      createMovieSchema.safeParse({
        title: "AB",
        genre: { name: "Action" },
        numberInStock: -1,
        dailyRentalRate: 10,
      }).success,
    ).toBe(false);

    expect(updateMovieSchema.safeParse({}).success).toBe(false);
  });

  it("should require valid ObjectIds for rentals", () => {
    expect(
      createRentalSchema.safeParse({
        customer: "not-an-object-id",
        movie: "not-an-object-id",
      }).success,
    ).toBe(false);
  });

  it("should accept valid user input", () => {
    expect(
      createUserSchema.safeParse({
        username: "john-doe",
        email: "john@example.com",
        password: "secret123",
      }).success,
    ).toBe(true);
  });
});
