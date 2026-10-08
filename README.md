<div align="center">

# 🎬 Vidly API

**A RESTful movie-rental backend built with TypeScript, Express 5, MongoDB, and Mongoose.**

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-ES%20Modules-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-Vitest%20%2B%20Supertest-6E9F18?logo=vitest&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

</div>

---

## Overview

Vidly API provides CRUD operations for **genres, movies, customers, rentals, and users**, together with cookie-based JWT authentication, role-based authorization, strict request validation, Argon2 password hashing, refresh-token rotation, and structured HTTP logging.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the API](#running-the-api)
- [Authentication](#authentication)
  - [Cookies](#cookies)
  - [Roles](#roles)
  - [Creating the First Admin](#creating-the-first-admin)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Genres](#genres)
  - [Movies](#movies)
  - [Customers](#customers)
  - [Rentals](#rentals)
  - [Users](#users)
- [Quick Walkthrough (cURL)](#quick-walkthrough-curl)
- [Error Responses](#error-responses)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Security Notes](#security-notes)
- [License](#license)

---

## Features

- ⚡ TypeScript API using native ES modules
- 🚀 Express 5 HTTP server
- 🍃 MongoDB persistence through Mongoose
- 👤 User registration and administration
- 🔐 Login, logout, access-token refresh, and refresh-token rotation
- 🍪 HTTP-only access and refresh cookies
- 🛡️ `admin` and `user` roles
- ✅ Zod request validation with strict object schemas
- 🆔 MongoDB ObjectId validation
- 🔑 Argon2 password hashing
- 📝 Pino HTTP and application logging
- 🧪 Unit and integration tests with Vitest and Supertest

## Technology Stack

| Area             | Technology            |
| ---------------- | --------------------- |
| Runtime          | Node.js               |
| Language         | TypeScript            |
| Web framework    | Express 5             |
| Database         | MongoDB               |
| ODM              | Mongoose              |
| Authentication   | JWT via `jose`        |
| Password hashing | Argon2                |
| Validation       | Zod                   |
| Logging          | Pino and `pino-http`  |
| Testing          | Vitest and Supertest  |

---

## Getting Started

### Prerequisites

- **Node.js 18+** (required by Express 5) and **npm**
- A running **MongoDB** instance
- A MongoDB connection URI, supplied through environment variables

> [!NOTE]
> This is an ES-module project (`"type": "module"` in `package.json`) and TypeScript sources use `.js` import specifiers. Always run it through the package scripts rather than invoking TypeScript files directly with Node.

### Installation

```bash
git clone https://github.com/Ubaid-Stack/vidly-api.git
cd vidly-api
npm install
```

### Configuration

Create a `.env` file in the project root for local development:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/vidly
JWT_SECRET=replace-with-a-long-random-access-token-secret
REFRESH_TOKEN_SECRET=replace-with-a-different-long-random-refresh-token-secret
```

#### Environment variables

| Variable               | Required | Default       | Description                                    |
| ---------------------- | :------: | ------------- | ---------------------------------------------- |
| `PORT`                 |    No    | `3000`        | Port used by the HTTP server                   |
| `NODE_ENV`             |    No    | `development` | Must be `development`, `test`, or `production` |
| `MONGO_URI`            |  **Yes** | —             | MongoDB connection string                      |
| `JWT_SECRET`           |  **Yes** | —             | Secret used to sign access tokens              |
| `REFRESH_TOKEN_SECRET` |  **Yes** | —             | Secret used to sign refresh tokens             |

#### Test configuration

When `NODE_ENV=test`, configuration is loaded from **`.env.test`** instead of `.env`:

```env
MONGO_URI=mongodb://localhost:27017/vidly_test
NODE_ENV=test
JWT_SECRET=replace-with-a-test-access-token-secret
REFRESH_TOKEN_SECRET=replace-with-a-test-refresh-token-secret
```

> [!WARNING]
> Never commit real secrets. Use different secrets for access and refresh tokens, and always use a separate database for tests.

### Running the API

**Development** (watch mode, restarts on source changes):

```bash
npm run dev
```

**Production** (compile, then run the compiled output):

```bash
npm run build
npm start
```

The server connects to MongoDB before it starts listening. With the default port, the API is available at:

```text
http://localhost:3000
```

There is currently no dedicated health-check endpoint. A successful request to a public `GET` endpoint, such as `GET /api/movies`, works as a basic application check.

---

## Authentication

### Cookies

Authentication uses two HTTP-only cookies:

| Cookie         | Lifetime   | Purpose                                         |
| -------------- | ---------- | ----------------------------------------------- |
| `accessToken`  | 15 minutes | Short-lived access JWT for protected routes     |
| `refreshToken` | 7 days     | Refresh JWT, rotated every time it is refreshed |

- Cookies use `SameSite=Strict`.
- In production they are also marked `Secure`, so the API **must** be served over HTTPS.
- The API does **not** use an `Authorization: Bearer ...` header. Protected routes read the access token from the `accessToken` cookie, so clients must preserve the cookies returned by login.

### Roles

| Role    | Permissions                                                       |
| ------- | ----------------------------------------------------------------- |
| `user`  | Read protected user details and user lists                        |
| `admin` | Create, update, and delete users and all managed rental resources |

Access levels used in the API reference below:

| Access           | Requirement                                           |
| ---------------- | ----------------------------------------------------- |
| `Public`         | No authentication                                     |
| `Authenticated`  | Valid access cookie, any role                         |
| `Admin`          | Valid access cookie and an `admin` user               |
| `Refresh cookie` | Valid refresh cookie                                  |

### Creating the First Admin

New users are stored with the role `user` by default, and creating users through the API requires an admin. Administrative users must therefore be created or assigned through your application or database setup. For example, to promote an existing user in `mongosh`:

```js
// Adjust the collection and field names if your model differs
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
```

---

## API Reference

All endpoints accept and return JSON unless noted otherwise. Resource IDs are MongoDB ObjectIds, and request bodies are validated with strict Zod schemas.

### Auth

| Method | Endpoint            | Access         | Description                                                           |
| ------ | ------------------- | -------------- | --------------------------------------------------------------------- |
| `POST` | `/api/auth/login`   | Public         | Validate credentials and set access and refresh cookies               |
| `POST` | `/api/auth/refresh` | Refresh cookie | Rotate the refresh token and issue new cookies                        |
| `POST` | `/api/auth/logout`  | Public         | Invalidate the refresh token when present and clear the refresh cookie |

**Login request**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login response**

```json
{
  "message": "Login successful"
}
```

> Tokens are returned as cookies, not in the JSON response body.

### Genres

| Method   | Endpoint          | Access | Description    |
| -------- | ----------------- | ------ | -------------- |
| `GET`    | `/api/genres`     | Public | List genres    |
| `GET`    | `/api/genres/:id` | Admin  | Get one genre  |
| `POST`   | `/api/genres`     | Admin  | Create a genre |
| `PATCH`  | `/api/genres/:id` | Admin  | Update a genre |
| `DELETE` | `/api/genres/:id` | Admin  | Delete a genre |

**Create / update body**

```json
{
  "name": "Science Fiction"
}
```

**Validation**

- `name`: 3 to 30 characters
- Updates must contain at least one field

### Movies

| Method   | Endpoint          | Access | Description    |
| -------- | ----------------- | ------ | -------------- |
| `GET`    | `/api/movies`     | Public | List movies    |
| `GET`    | `/api/movies/:id` | Public | Get one movie  |
| `POST`   | `/api/movies`     | Admin  | Create a movie |
| `PATCH`  | `/api/movies/:id` | Admin  | Update a movie |
| `DELETE` | `/api/movies/:id` | Admin  | Delete a movie |

**Create request**

```json
{
  "title": "The Matrix",
  "genre": {
    "name": "Science Fiction"
  },
  "numberInStock": 5,
  "dailyRentalRate": 12
}
```

**Validation**

- `title`: 3 to 30 characters
- `genre.name`: 3 to 30 characters
- `numberInStock`: number from 0 to 1000
- `dailyRentalRate`: number from 0 to 1000

### Customers

| Method   | Endpoint            | Access | Description       |
| -------- | ------------------- | ------ | ----------------- |
| `GET`    | `/api/customer`     | Public | List customers    |
| `GET`    | `/api/customer/:id` | Admin  | Get one customer  |
| `POST`   | `/api/customer`     | Admin  | Create a customer |
| `PATCH`  | `/api/customer/:id` | Admin  | Update a customer |
| `DELETE` | `/api/customer/:id` | Admin  | Delete a customer |

**Create request**

```json
{
  "name": "Jane Doe",
  "phone": "+1 555 0100",
  "isGold": false
}
```

**Validation**

- `name`: 3 to 30 characters
- `phone`: 5 to 20 characters
- `isGold`: boolean, defaults to `false`

### Rentals

| Method   | Endpoint           | Access | Description     |
| -------- | ------------------ | ------ | --------------- |
| `GET`    | `/api/rentals`     | Public | List rentals    |
| `GET`    | `/api/rentals/:id` | Admin  | Get one rental  |
| `POST`   | `/api/rentals`     | Admin  | Create a rental |
| `PUT`    | `/api/rentals/:id` | Admin  | Update a rental |
| `DELETE` | `/api/rentals/:id` | Admin  | Delete a rental |

**Create request**

```json
{
  "customer": "64f000000000000000000001",
  "movie": "64f000000000000000000002"
}
```

The customer and movie must both exist. The rental fee is initialized from the movie's `dailyRentalRate`.

**Return a rental** by sending an optional `dateReturned` value:

```json
{
  "dateReturned": "2026-10-07T10:00:00.000Z"
}
```

### Users

| Method   | Endpoint         | Access        | Description     |
| -------- | ---------------- | ------------- | --------------- |
| `GET`    | `/api/users`     | Authenticated | List users      |
| `GET`    | `/api/users/:id` | Authenticated | Get one user    |
| `POST`   | `/api/users`     | Admin         | Create a user   |
| `PUT`    | `/api/users/:id` | Admin         | Update a user   |
| `DELETE` | `/api/users/:id` | Admin         | Delete a user   |

**Create request**

```json
{
  "username": "jane",
  "email": "jane@example.com",
  "password": "password123"
}
```

**Validation**

- `username`: 3 to 30 characters
- `email`: valid email address, normalized to lowercase
- `password`: 6 to 1024 characters

Passwords are stored as **Argon2 hashes**. New users receive the `user` role by default.

---

## Quick Walkthrough (cURL)

The examples below use a cookie jar (`cookies.txt`) so that cookies from login are sent on later requests. They assume the development server on `http://localhost:3000`.

```bash
# 1. Log in and store the auth cookies
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# 2. Call a public endpoint
curl http://localhost:3000/api/movies

# 3. Create a genre (admin only)
curl -b cookies.txt -X POST http://localhost:3000/api/genres \
  -H "Content-Type: application/json" \
  -d '{"name":"Science Fiction"}'

# 4. Rotate tokens
curl -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/auth/refresh

# 5. Log out
curl -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

> [!TIP]
> Because production cookies are `Secure`, test against an HTTPS deployment when `NODE_ENV=production`.

---

## Error Responses

Validation and application errors are returned as JSON. A typical validation error looks like this:

```json
{
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Status codes

| Status | Meaning                                                  |
| ------ | -------------------------------------------------------- |
| `200`  | Successful read or update                                |
| `201`  | Resource created                                         |
| `204`  | Resource deleted successfully                            |
| `400`  | Invalid JSON, validation error, or malformed ObjectId    |
| `401`  | Authentication required, or invalid/expired credentials  |
| `403`  | Authenticated user lacks the required role               |
| `404`  | Resource not found                                       |
| `409`  | Duplicate unique value                                   |
| `500`  | Unexpected server error                                  |

---

## Project Structure

```text
src/
├── app.ts                  # Express application and route registration
├── server.ts               # Database connection and HTTP server startup
├── config/
│   ├── db.ts               # MongoDB connection helper
│   └── env.ts              # Environment parsing and validation
├── controllers/            # HTTP request/response handlers
├── middlewares/            # Authentication, authorization, validation, errors
├── models/                 # Mongoose models
├── routes/                 # Resource route definitions
├── schema/                 # Zod request schemas
├── services/               # Business logic and database operations
├── types/                  # TypeScript declarations
└── utils/                  # JWT, passwords, refresh tokens, and logging

tests/
├── unit/                   # Utility and schema tests
├── integration/            # API endpoint tests
└── setup.ts                # Test database setup and teardown
```

---

## Available Scripts

| Command                    | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `npm install`              | Install dependencies                             |
| `npm run dev`              | Start the watch-mode development server          |
| `npm run build`            | Compile TypeScript into `dist/`                  |
| `npm start`                | Start the compiled production server             |
| `npm test`                 | Run unit and integration tests with V8 coverage  |
| `npm run test:integration` | Run integration tests with `NODE_ENV=test`       |

## Testing

Integration tests require a MongoDB instance configured through `.env.test`.

```bash
# Run the complete suite (unit + integration) with coverage
npm test

# Run integration tests only
npm run test:integration
```

The integration suite uses a separate database and cleans up its test documents during setup and teardown.

> [!CAUTION]
> Do not point `MONGO_URI` or `.env.test` at a production database.

---

## Security Notes

- Keep `.env` and production credentials out of source control.
- Use strong, unique secrets for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`.
- Use HTTPS in production, since `Secure` cookies are enabled when `NODE_ENV=production`.
- Keep both the access-token and refresh-token cookies HTTP-only.
- Use a dedicated MongoDB database and credentials for each environment.
- The API is designed for a trusted client that can preserve cookies. Add **CSRF protection** and a **deployment-specific CORS policy** before exposing cookie-authenticated endpoints across origins.

---

## License

This project is licensed under the **ISC** license, as declared in `package.json`.
