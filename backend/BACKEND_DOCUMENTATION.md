# Fast Trello Backend Documentation

This folder contains the Spring Boot backend for the Fast Trello MVP. It exposes REST APIs for authentication, boards, lists, health checks, JWT security, and PostgreSQL persistence.

## Technology Used

- Java 17 as the configured project language level.
- Spring Boot 4 for application bootstrapping and dependency management.
- Spring Web MVC for REST controllers and HTTP endpoints.
- Spring Security for protected routes and stateless JWT authentication.
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
- Scope board and list access to the authenticated user.
- Store users, boards, lists, and existing card schema in PostgreSQL.
- Run database migrations through Flyway.
- Provide a simple `/health` endpoint for startup checks.

## Folder Structure

```txt
backend/
  src/main/java/com/trello/backend/
    auth/        User entity, auth controller, service, DTOs, JWT helpers
    board/       Board entity, repository, service, controller, DTOs
    list/        List entity, repository, service, controller, DTOs
    common/      Health endpoint
    config/      Spring Security and CORS configuration
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
JWT_EXP_MS
```

`JWT_EXP_MS` has a default of `86400000` milliseconds, which is one day.

The local `.env.backend` file is used by the documented run command to load database and JWT settings into the shell before starting Spring Boot.

## Security Flow

The backend uses stateless JWT authentication.

1. User registers or logs in through `/api/auth/register` or `/api/auth/login`.
2. `AuthService` validates credentials.
3. Passwords are checked with BCrypt.
4. `JwtService` creates a signed JWT.
5. Frontend sends the JWT in the `Authorization: Bearer <token>` header.
6. `JwtAuthenticationFilter` reads the token on each request.
7. If valid, the user id is placed into Spring Security's `Authentication`.
8. Board and list controllers use the authenticated user id to enforce ownership.

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
GET, POST, PUT, DELETE, OPTIONS
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

`spring.jpa.hibernate.ddl-auto=update` is currently enabled. For a production-style setup, prefer relying fully on Flyway migrations and disabling Hibernate auto schema updates.

## Entities

Current JPA entities:

- `User` for registered users.
- `Board` for user-owned boards.
- `ListEntity` for lists inside a board.

The initial database schema also includes a `cards` table, but card APIs and JPA code are not implemented yet.

## API Endpoints

Health:

```txt
GET /health
```

Auth:

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Boards:

```txt
POST   /api/boards
GET    /api/boards
GET    /api/boards/{id}
DELETE /api/boards/{id}
```

Lists:

```txt
POST   /api/boards/{boardId}/lists
GET    /api/boards/{boardId}/lists
PATCH  /api/boards/{boardId}/lists/{id}
DELETE /api/boards/{boardId}/lists/{id}
```

## Request Validation And Errors

Request DTOs use Jakarta Validation annotations. Invalid requests are handled through `GlobalExceptionHandler`, which returns structured error responses for validation and auth-related failures.

Ownership checks are enforced in the service/controller flow:

- Boards are fetched by `boardId` and authenticated `ownerId`.
- Lists are always scoped under a board, and board ownership is verified before list access.

## Running The Backend

From the `backend` folder:

```bash
set -o allexport; source .env.backend; set +o allexport
./mvnw spring-boot:run
```

Default URL:

```txt
http://localhost:8080
```

Health check:

```bash
curl http://localhost:8080/health
```

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
- JWT token issuing and validation.
- Protected API routes.
- Board create, list, fetch, and delete.
- List create, list, rename/reposition, and delete.
- Flyway-backed schema management.
- Health endpoint.

Not implemented yet:

- Card REST APIs.
- Drag-and-drop ordering API for cards.
- WebSocket realtime updates.
- Board sharing or collaborators.
- Dedicated local test database profile.

## Notes For Future Development

For the next backend stage, add card support in the same pattern used by boards and lists:

- `card/Card.java`
- `card/CardRepository.java`
- `card/CardService.java`
- `card/CardController.java`
- card request/response DTOs
- Flyway migration for any schema changes

Keep ownership checks at the service boundary so future controllers cannot accidentally expose another user's data.
