# Vidly API

Vidly API is a RESTful movie-rental backend built with TypeScript, Express, MongoDB, and Mongoose. It provides CRUD operations for genres, movies, customers, rentals, and users, together with cookie-based JWT authentication, role-based authorization, request validation, password hashing, refresh-token rotation, and structured HTTP logging.

## Features

- TypeScript API using native ES modules
- Express 5 HTTP server
- MongoDB persistence through Mongoose
- User registration and administration
- Login, logout, access-token refresh, and refresh-token rotation
- HTTP-only access and refresh cookies
- `admin` and `user` roles
- Zod request validation with strict object schemas
- MongoDB ObjectId validation
- Argon2 password hashing
- Pino HTTP/application logging
- Unit and integration tests with Vitest and Supertest

## Technology stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Language | TypeScript |
| Web framework | Express 5 |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT via `jose` |
| Password hashing | Argon2 |
| Validation | Zod |
| Logging | Pino and `pino-http` |
| Testing | Vitest and Supertest |

## Requirements

- Node.js with npm
- A running MongoDB instance
- A MongoDB database URI available through environment variables

The project is an ES-module project (`"type": "module"` in `package.json`) and uses `.js` import specifiers in TypeScript source files. Run it with the package scripts rather than invoking TypeScript files directly with Node.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the project root for local development:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/vidly
JWT_SECRET=replace-with-a-long-random-access-token-secret
REFRESH_TOKEN_SECRET=replace-with-a-different-long-random-refresh-token-secret
```

### Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | Port used by the HTTP server |
| `NODE_ENV` | No | `development` | Must be `development`, `test`, or `production` |
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret used to sign access tokens |
| `REFRESH_TOKEN_SECRET` | Yes | — | Secret used to sign refresh tokens |

When `NODE_ENV=test`, configuration is loaded from `.env.test` instead of `.env`. A test configuration can look like this:

```env
MONGO_URI=mongodb://localhost:27017/vidly_test
NODE_ENV=test
JWT_SECRET=replace-with-a-test-access-token-secret
REFRESH_TOKEN_SECRET=replace-with-a-test-refresh-token-secret
```

Do not commit production secrets. Use different secrets for access tokens and refresh tokens, and use a separate database for tests.

## Running the API

Start the development server with automatic restart on source changes:

```bash
npm run dev
```

The `start` script currently has the same watch behavior:

```bash
npm start
```

The server connects to MongoDB before it begins listening. With the default port, the API is available at:

```text
http://localhost:3000
```

There is currently no dedicated health-check endpoint. A successful request to a public `GET` endpoint, such as `GET /api/movies`, can be used as a basic application check.

## Authentication

Authentication uses two HTTP-only cookies:

- `accessToken`: short-lived access JWT, valid for 15 minutes
- `refreshToken`: refresh JWT, valid for 7 days and rotated when refreshed

Cookies use `SameSite=Strict`. In production, they are also marked `Secure`, so the API must be served over HTTPS.

Authenticated requests should preserve the cookies returned by login. The API does not expect an `Authorization: Bearer ...` header; protected routes read the access token from the `accessToken` cookie.

### Roles

| Role | Permissions |
| --- | --- |
| `user` | Read protected user details and user lists |
| `admin` | Create, update, and delete users and all managed rental resources |

Public read endpoints are listed below. Routes marked `admin` require a valid access cookie and an admin user. Routes marked `authenticated` require a valid access cookie but allow either role.

## API reference

All endpoints use JSON request and response bodies unless noted otherwise. Resource IDs are MongoDB ObjectIds.

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Public | Validate credentials and set access/refresh cookies |
| `POST` | `/api/auth/refresh` | Refresh cookie | Rotate the refresh token and issue new cookies |
| `POST` | `/api/auth/logout` | Public | Invalidate the refresh token when present and clear the refresh cookie |

Login request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Successful login response:

```json
{
  "message": "Login successful"
}
```

The tokens are returned as cookies, not in the JSON response body.

### Genres

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/genres` | Public | List genres |
| `GET` | `/api/genres/:id` | Admin | Get one genre |
| `POST` | `/api/genres` | Admin | Create a genre |
| `PATCH` | `/api/genres/:id` | Admin | Update a genre |
| `DELETE` | `/api/genres/:id` | Admin | Delete a genre |

Create or update fields:

```json
{
  "name": "Science Fiction"
}
```

`name` must contain 3 to 30 characters. Updates must contain at least one field.

### Movies

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/movies` | Public | List movies |
| `GET` | `/api/movies/:id` | Public | Get one movie |
| `POST` | `/api/movies` | Admin | Create a movie |
| `PATCH` | `/api/movies/:id` | Admin | Update a movie |
| `DELETE` | `/api/movies/:id` | Admin | Delete a movie |

Create request:

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

Validation rules:

- `title`: 3 to 30 characters
- `genre.name`: 3 to 30 characters
- `numberInStock`: number from 0 to 1000
- `dailyRentalRate`: number from 0 to 1000

### Customers

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/customer` | Public | List customers |
| `GET` | `/api/customer/:id` | Admin | Get one customer |
| `POST` | `/api/customer` | Admin | Create a customer |
| `PATCH` | `/api/customer/:id` | Admin | Update a customer |
| `DELETE` | `/api/customer/:id` | Admin | Delete a customer |

Create request:

```json
{
  "name": "Jane Doe",
  "phone": "+1 555 0100",
  "isGold": false
}
```

`name` must contain 3 to 30 characters, `phone` must contain 5 to 20 characters, and `isGold` defaults to `false`.

### Rentals

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/rentals` | Public | List rentals |
| `GET` | `/api/rentals/:id` | Admin | Get one rental |
| `POST` | `/api/rentals` | Admin | Create a rental |
| `PUT` | `/api/rentals/:id` | Admin | Update a rental |
| `DELETE` | `/api/rentals/:id` | Admin | Delete a rental |

Create request:

```json
{
  "customer": "64f000000000000000000001",
  "movie": "64f000000000000000000002"
}
```

The customer and movie must exist. The rental fee is initialized from the movie's `dailyRentalRate`. To return a rental, send an optional `dateReturned` value:

```json
{
  "dateReturned": "2026-10-07T10:00:00.000Z"
}
```

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users` | Authenticated | List users |
| `GET` | `/api/users/:id` | Authenticated | Get one user |
| `POST` | `/api/users` | Admin | Create a user |
| `PUT` | `/api/users/:id` | Admin | Update a user |
| `DELETE` | `/api/users/:id` | Admin | Delete a user |

Create request:

```json
{
  "username": "jane",
  "email": "jane@example.com",
  "password": "password123"
}
```

Validation rules:

- `username`: 3 to 30 characters
- `email`: valid email address; normalized to lowercase
- `password`: 6 to 1024 characters

Passwords are stored as Argon2 hashes. The API stores a user role of `user` by default; administrative users must be created or assigned through the application/database setup.

## Error responses

Validation and application errors use JSON responses. Common response shapes include:

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

Common status codes:

| Status | Meaning |
| --- | --- |
| `200` | Successful read or update |
| `201` | Resource created |
| `204` | Resource deleted successfully |
| `400` | Invalid JSON data, validation error, or malformed ObjectId |
| `401` | Authentication required or invalid/expired credentials |
| `403` | Authenticated user lacks the required role |
| `404` | Resource not found |
| `409` | Duplicate unique value |
| `500` | Unexpected server error |

## Project structure

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

## Testing

Integration tests require a MongoDB instance configured through `.env.test`.

Run the complete test suite with coverage:

```bash
npm test
```

Build the production JavaScript output:

```bash
npm run build
```

Start the compiled production server:

```bash
npm start
```

Run integration tests only:

```bash
npm run test:integration
```

The integration suite uses a separate database and cleans up its test documents during setup/teardown. Do not point `MONGO_URI` or `.env.test` at a production database.

## Available scripts

| Command | Description |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the watch-mode development server |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Start the compiled production server |
| `npm test` | Run unit and integration tests with V8 coverage |
| `npm run test:integration` | Run tests with `NODE_ENV=test` |

## Security notes

- Keep `.env` and production credentials out of source control.
- Use strong, unique secrets for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`.
- Use HTTPS in production because secure cookies are enabled when `NODE_ENV=production`.
- Keep the access-token cookie and refresh-token cookie HTTP-only.
- Use a dedicated MongoDB database and credentials for each environment.
- The current API is designed for a trusted client that can preserve cookies; add CSRF protection and a deployment-specific CORS policy before exposing cookie-authenticated endpoints across origins.

## License

This project currently declares the ISC license in `package.json`.
