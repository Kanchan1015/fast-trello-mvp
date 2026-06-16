# Fast Trello Backend Documentation

This folder contains the Spring Boot backend for the Fast Trello MVP. It exposes REST APIs for authentication, boards, members, lists, cards, health checks, JWT cookie security, realtime board updates, and PostgreSQL persistence.

## Technology Used

- Java 17 as the configured project language level.
- Spring Boot 4 for application bootstrapping and dependency management.
- Spring Web MVC for REST controllers and HTTP endpoints.
- Spring Security for protected routes, HTTPS enforcement, HSTS, JWT cookies, and auth rate limiting.
- Spring WebSocket with STOMP and SockJS for realtime board events.
- Spring Data JPA for repository-based database access.
- Hibernate ORM for mapping Java entities to PostgreSQL tables.
- PostgreSQL as the application database.
- Neon PostgreSQL as the hosted database provider used by local env config.
- Flyway for database migrations.
- Jakarta Validation for request DTO validation.
- BCrypt for password hashing.
- JJWT for JWT creation and validation.
- Maven Wrapper for repeatable local builds and runs.
- Lombok is included as an optional dependency, though most current code uses explicit Java classes.

## Main Backend Responsibilities

- Register and authenticate users.
- Hash passwords before storing them.
- Issue JWT tokens after login/signup.
- Validate JWT tokens on protected requests.
- Store access/refresh tokens in secure HttpOnly cookies.
- Rotate long-lived refresh tokens and store only refresh-token hashes.
- Rate limit login and registration.
- Scope board, list, and card access to owners and board collaborators.
- Store users, boards, members, lists, cards, and refresh tokens in PostgreSQL.
- Run database migrations through Flyway.
- Publish board update events over STOMP.
- Reject PostgreSQL JDBC URLs that do not explicitly require SSL.
- Provide a simple `/health` endpoint for startup checks.

## Folder Structure

```txt
backend/
  src/main/java/com/trello/backend/
    auth/        User entity, auth controller, service, DTOs, JWT helpers, refresh tokens, rate limiting
    board/       Board entity, repository, service, controller, DTOs
    boardmember/ Board collaborator entity, repository, service, controller, DTOs
    card/        Card entity, repository, service, controller, DTOs
    list/        List entity, repository, service, controller, DTOs
    common/      Health endpoint
    config/      Spring Security, CORS, WebSocket, HTTPS, database security config
    realtime/    Board event publishing DTO/component
    BackendApplication.java

  src/main/resources/
    application.properties
    db/migration/   Flyway SQL migrations

  pom.xml
```

## Configuration

Main config is in `src/main/resources/application.properties`.

Important environment variables:

```txt
JDBC_URL
JDBC_USERNAME
JDBC_PASSWORD
JWT_SECRET
JWT_ACCESS_EXP_MS
JWT_REFRESH_EXP_MS
```

`JWT_ACCESS_EXP_MS` defaults to `900000` milliseconds, which is 15 minutes.
`JWT_REFRESH_EXP_MS` defaults to `2592000000` milliseconds, which is 30 days.

`JDBC_URL` must be a PostgreSQL JDBC URL that includes one of:

```txt
sslmode=require
sslmode=verify-ca
sslmode=verify-full
```

The app fails fast at startup if a PostgreSQL JDBC URL does not explicitly require an encrypted connection.

The local `.env.backend` file is used by the documented run command to load database and JWT settings into the shell before starting Spring Boot.

## Security Flow

The backend uses JWT access tokens and rotating refresh tokens stored in secure cookies.

1. User registers or logs in through `/api/auth/register` or `/api/auth/login`.
2. `AuthService` validates credentials.
3. Passwords are checked with BCrypt.
4. `JwtService` creates a short-lived signed access JWT.
5. `RefreshTokenService` creates an opaque refresh token, stores its SHA-256 hash, and sets an expiry.
6. `AuthController` sets both tokens in HttpOnly, Secure, SameSite=Strict cookies.
7. `JwtAuthenticationFilter` reads the access token from the cookie on protected requests.
8. If valid, the user id is placed into Spring Security's `Authentication`.
9. If the access token expires, the frontend calls `/api/auth/refresh`.
10. Refresh rotates the refresh token: the old token is revoked and a replacement is issued.
11. Board/list/card controllers use the authenticated user id to enforce owner-or-collaborator access.

Logout revokes the current refresh token and clears both auth cookies.

WebSocket board subscriptions are protected through the SockJS handshake cookie and a STOMP inbound interceptor that verifies board access before allowing `/topic/boards/{boardId}` subscriptions.

Login and registration are rate limited per client IP. The current in-memory bucket allows 10 requests per minute per endpoint/IP.

Spring Security requires HTTPS for all requests and emits HSTS headers. If the app runs behind a TLS-terminating proxy, keep `server.forward-headers-strategy=framework` enabled.

Public endpoints:

```txt
/health
/api/auth/**
```

All other endpoints require authentication.

## CORS

CORS is configured in `SecurityConfig`.

Allowed local frontend origins:

```txt
http://localhost:5173
http://127.0.0.1:5173
```

Allowed methods:

```txt
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

## Database And Flyway

The backend uses PostgreSQL with Flyway migrations stored in:

```txt
src/main/resources/db/migration/
```

Current migrations:

- `V1__init.sql` creates initial users, boards, lists, and cards tables.
- `V2__add_table.sql` is an older migration kept in sequence.
- `V3__create_boards.sql` ensures the board table exists.
- `V4__create_lists.sql` defines the newer list schema with `title` and double precision `position`.
- `V5__fix_lists_remove_name.sql` removes the old `name` column from lists.
- `V6__repair_lists_schema.sql` repairs the list schema so existing databases get the correct `title` column and numeric position type.
- `V7__cards_and_board_members.sql` repairs card schema, adds card descriptions, and creates board collaborator membership.
- `V8__create_refresh_tokens.sql` creates hashed refresh-token storage for rotation.

`spring.jpa.hibernate.ddl-auto=update` is currently enabled. For a production-style setup, prefer relying fully on Flyway migrations and disabling Hibernate auto schema updates.

## Entities

Current JPA entities:

- `User` for registered users.
- `Board` for boards.
- `BoardMember` for board collaborators.
- `ListEntity` for lists inside a board.
- `CardEntity` for cards inside lists.
- `RefreshToken` for hashed refresh-token persistence.

## API Endpoints

Health:

```txt
GET /health
```

Auth:

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

Boards:

```txt
POST   /api/boards
GET    /api/boards
GET    /api/boards/{id}
DELETE /api/boards/{id}
```

Board members:

```txt
GET    /api/boards/{boardId}/members
POST   /api/boards/{boardId}/members
DELETE /api/boards/{boardId}/members/{userId}
```

Lists:

```txt
POST   /api/boards/{boardId}/lists
GET    /api/boards/{boardId}/lists
PATCH  /api/boards/{boardId}/lists/{id}
DELETE /api/boards/{boardId}/lists/{id}
```

Cards:

```txt
GET    /api/boards/{boardId}/cards
POST   /api/boards/{boardId}/lists/{listId}/cards
PATCH  /api/boards/{boardId}/lists/{listId}/cards/{cardId}
DELETE /api/boards/{boardId}/lists/{listId}/cards/{cardId}
```

Realtime:

```txt
SockJS/STOMP endpoint: /ws
Board topic: /topic/boards/{boardId}
```

## Request Validation And Errors

Request DTOs use Jakarta Validation annotations. Invalid requests are handled through `GlobalExceptionHandler`, which returns structured error responses for validation and auth-related failures.

Ownership checks are enforced in the service/controller flow:

- Boards are fetched by `boardId` and authenticated user id.
- Access is granted to the owner or a `board_members` collaborator.
- Lists and cards are always scoped under a board, and board access is verified before mutation.
- Member add/remove operations require board ownership.

## Running The Backend

From the `backend` folder:

```bash
set -o allexport; source .env.backend; set +o allexport
./mvnw spring-boot:run
```

Default URL:

```txt
https://localhost:8080
```

Health check:

```bash
curl https://localhost:8080/health
```

The backend now requires HTTPS and secure cookies. For local browser testing, run through a TLS proxy or configure HTTPS for the local backend.

Expected response:

```json
{ "status": "UP" }
```

## Build And Test Commands

Compile without running tests:

```bash
./mvnw -DskipTests compile
```

Run tests:

```bash
./mvnw test
```

The current test setup needs database environment variables because the Spring context loads the real datasource configuration.

## Current Feature Status

Implemented:

- User registration and login.
- Secure cookie-based JWT access-token issuing and validation.
- Refresh token rotation with hashed database storage.
- Logout revocation and cookie clearing.
- Auth endpoint rate limiting.
- HTTPS/HSTS and database SSL validation.
- Protected API routes.
- Board create, list, fetch, and delete.
- Board collaborator list/add/remove.
- List create, list, rename/reposition, and delete.
- Card create, list, update/move/reposition, and delete.
- STOMP/SockJS realtime board update publishing.
- Flyway-backed schema management.
- Health endpoint.

Not implemented yet:

- Dedicated local test database profile.
- Distributed rate limiting for multi-instance production deployments.

## Notes For Future Development

Keep authorization checks at the service boundary so future controllers cannot accidentally expose another user's data. If this app is scaled to multiple backend instances, replace the in-memory auth rate limiter with shared storage such as Redis or a gateway-level limiter.
