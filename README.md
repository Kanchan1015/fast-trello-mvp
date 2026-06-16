# Fast Trello MVP

A lightweight Trello-style board app built with **Spring Boot**, **React (Vite + TypeScript)**, **Neon PostgreSQL**, **Flyway**, **JWT cookie authentication**, and **realtime board sync**.
Designed with clean architecture and minimal, well-structured features.

---

# Project Overview

Fast Trello MVP is a collaborative task-board application inspired by Trello. Users can sign up, log in, create boards, invite collaborators, organize work into lists, and manage cards inside those lists. Lists and cards can be reordered with drag-and-drop, and board changes are synchronized in realtime so multiple people viewing the same board stay up to date.

The project demonstrates several full-stack concepts in one compact codebase:

- Secure authentication with short-lived access JWTs in HttpOnly cookies and rotating refresh tokens stored as database hashes.
- Role-style board access where boards can be owned by one user and shared with collaborators.
- Ordered data modeling using floating-point `position` values for lists and cards, with compaction when spacing gets too tight.
- Optimistic frontend updates with React Query for fast interactions and rollback on failure.
- Realtime synchronization using Spring WebSocket/STOMP/SockJS on the backend and a STOMP client on the frontend.
- Database evolution through Flyway migrations instead of ad hoc schema changes.
- Security hardening with auth rate limiting, HTTPS/HSTS, and encrypted PostgreSQL connection validation.

What is significant here is that this is not only a CRUD demo. It connects authentication, authorization, realtime collaboration, drag-and-drop ordering, database migrations, and production-oriented security practices into a working MVP structure.

---

# Tech Stack

### **Frontend**

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-fast-purple?logo=vite)
![React Query](https://img.shields.io/badge/React_Query-Server_State-red?logo=reactquery)
![Axios](https://img.shields.io/badge/Axios-HTTP-orange?logo=axios)
![Tailwind](https://img.shields.io/badge/TailwindCSS-Utility_CSS-38B2AC?logo=tailwindcss)
![dnd-kit](https://img.shields.io/badge/dnd--kit-Drag_Drop-black)
![STOMP](https://img.shields.io/badge/STOMP-WebSocket-blue)

### **Backend**

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-green?logo=springboot)
![Spring Security](https://img.shields.io/badge/Security-JWT_Cookies-green?logo=springsecurity)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-red?logo=flyway)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?logo=postgresql)

---

# Current Progress

Below is everything implemented so far in the project.

---

## **1. Workspace & Initial Setup**

- Repo structured into `frontend/` and `backend/`
- Verified environment: Node, Java 17+, Maven
- Setup VS Code tooling (ESLint, Prettier, Java, Tailwind)

---

## **2. Frontend Setup (Vite + React + TS)**

- Scaffolded Vite React + TypeScript project

- Installed core dependencies:

  - React Router
  - React Query
  - Axios
  - TailwindCSS (optional but recommended)

- Created app structure:

  ```
  src/
    pages/
    components/
    api/
    utils/
    context/
  ```

- Added base routes & placeholder pages

---

## **3. Backend Setup (Spring Boot)**

- Generated project with:

  - Web
  - Security
  - JPA
  - Validation
  - Flyway
  - PostgreSQL driver

- Added package layout for clean architecture:

  ```
  auth/
  board/
  boardmember/
  card/
  common/
  config/
  list/
  realtime/
  ```

---

## **4. Database Integration (Neon + Flyway)**

- Connected backend to Neon PostgreSQL (env variables)

- Flyway migrations implemented:

  **`V1__init.sql`**
  Creates tables: `users`, `boards`, `lists`, `cards`

  **`V2__add_table.sql`**
  Creates table: `stuffs`

  **`V3__create_boards.sql`**
  Ensures board schema is correct.

  **`V4__create_lists.sql`**
  Ensures list schema is correct (specifies position as DOUBLE PRECISION).

  **`V5__fix_lists_remove_name.sql`**
  Drops the obsolete `name` column from the `lists` table.

  **`V6__repair_lists_schema.sql`**
  Ensures `title` column is added and `position` column type is altered for instances created via `V1`.

  **`V7__cards_and_board_members.sql`**
  Repairs card position typing, adds card description support, and creates board collaborator membership.

  **`V8__create_refresh_tokens.sql`**
  Creates hashed refresh-token storage for rotation-backed sessions.

- Flyway verified through logs & Neon console

---

## **5. Spring Security Configuration**

- JWT authentication with HttpOnly, Secure, SameSite=Strict cookies
- Short-lived access token and long-lived refresh-token rotation
- Auth rate limiting for login and registration
- HTTPS enforcement and HSTS headers
- PostgreSQL JDBC URLs must explicitly request encrypted SSL connections

- Completely configured filter chain with:

  - `JwtAuthenticationFilter`
  - `AuthRateLimitingFilter`
  - Password encoder (BCrypt)

- Public routes:

  - `/api/auth/**`
  - `/health`

- All other endpoints protected

---

## **6. Health Endpoint**

Simple app check at:

```
GET /health → { "status": "UP" }
```

---

## **7. User Model, DTOs & Auth Service**

Implemented:

- `User` JPA entity

- DTOs:

  - RegisterRequest
  - LoginRequest
  - AuthResponse
  - UserDto

- `UserRepository` with email lookup

- `AuthService` handles:

  - registration
  - password hashing
  - login validation
  - pulling user from SecurityContext

---

## **8. JWT Authentication System**

- `JwtService` for issuing + validating short-lived access tokens
- HMAC signing (HS256)
- Expiry handling
- `JwtAuthenticationFilter` reads the access token from an HttpOnly cookie and loads the user into SecurityContext
- Refresh tokens are opaque random tokens, stored as SHA-256 hashes in the database, and rotated on every refresh
- Integrated into security chain

---

## **9. Authentication API**

Auth endpoints implemented:

| Method | Endpoint             | Description                            |
| ------ | -------------------- | -------------------------------------- |
| POST   | `/api/auth/register` | Register user, set cookies, return user |
| POST   | `/api/auth/login`    | Login user, set cookies, return user   |
| POST   | `/api/auth/refresh`  | Rotate refresh token and set new access/refresh cookies |
| POST   | `/api/auth/logout`   | Revoke refresh token and clear cookies |
| GET    | `/api/auth/me`       | Fetch authenticated user               |

Structured error messages + validation included.

---

## **10. Token Storage & Axios Interceptors**

- JWTs are not stored in `localStorage`.
- Access and refresh tokens are stored in HttpOnly, Secure, SameSite=Strict cookies.
- Axios uses `withCredentials: true`.
- Handles 401 by attempting `/api/auth/refresh`; if refresh fails, it clears client auth state and routes to login.

---

## **11. Frontend Authentication Experience**

Login & Signup pages implemented with:

- Controlled inputs
- Validation
- Error display
- Loading states
- Toasts for success/error
- Keyboard accessibility

---

## **12. App Bootstrap & Session Restore**

- `AuthProvider` built with React Context
- Restores session using `/api/auth/me`
- Prevents UI flashes before auth state resolves
- Exposes:

```
user
isAuthenticated
loading
login()
logout()
```

---

## **13. Protected Routing**

`<RequireAuth />` wrapper added:

- Guards dashboard + board pages
- Redirects unauthenticated users
- Prevents protected content flashing
- Persists “intended route” for redirect after login

---

## **14. Global Header & Sign-Out**

- Header shows user name
- Logout calls the backend to revoke/clear cookies and clears client context
- Redirects + toast shown

---

## **15. UX & Accessibility Polish**

- Toast feedback for major actions
- Aria labels for form fields & buttons
- `role="alert"` for error messages
- Focus management after navigation
- Disabled buttons & spinners during create/delete

---

## **16. Board Feature — Backend**

Backend now supports full board CRUD.

Implemented:

### **Board Entity & Repository**

- `Board` JPA entity with:

  - id
  - name
  - ownerId
  - createdAt

- `BoardRepository` with:

  ```
  findByOwnerId(ownerId)
  ```

### **BoardService**

- Create board
- List boards per owner
- Fetch single board
- Delete board
- Ownership enforced at service layer

### **BoardController**

Endpoints:

| Method | Endpoint           | Description               |
| ------ | ------------------ | ------------------------- |
| POST   | `/api/boards`      | Create board              |
| GET    | `/api/boards`      | List user boards          |
| GET    | `/api/boards/{id}` | Get board (owner only)    |
| DELETE | `/api/boards/{id}` | Delete board (owner only) |

Security fully integrated.

---

## **17. Frontend — Boards API Client**

Added `src/api/boards.ts`:

```
createBoard()
listBoards()
getBoard()
deleteBoard()
```

Centralized axios handles auth automatically.

---

## **18. Dashboard Page**

Fully implemented dashboard experience:

- Fetch boards with React Query
- Render board cards
- Empty state handling
- Loading skeletons
- Delete button per board
- Link to `/boards/:id`

---

## **19. Create Board — Optimistic UI**

- Instant board creation with optimistic cache update
- Temporary `temp-<>` ID while waiting for server
- Rollback on error
- Toasts for success/failure
- Disabled button while creating

---

## **20. Delete Board — Optimistic UI**

- Inline delete button with confirmation
- Immediate removal from UI
- Rollback on error
- Toasts for success/failure
- Loading state per-card

---

## **21. Board Page Route**

Added route:

```
/boards/:id
```

Implemented `BoardPage`:

- Fetches board data
- Shows loading/error states
- Header + created date
- Renders lists, cards, collaborators, drag-and-drop, and realtime cache refresh

---

## **22. Dashboard UX Polish**

- Smooth transitions for cards
- Accessible buttons + labels
- Focus input automatically when creating boards
- Better spacing & layout structure

---

## **23. Lists CRUD System**

Fully implemented List CRUD functionality across backend and frontend:
- **Backend**:
  - Entity & DTO mappings for List.
  - Transactional CRUD logic in `ListService` including optimistic double-precision insertion spacing and automatic re-indexing (compaction) on convergence.
  - Security check integration scoping lists to parent board access.
- **Frontend**:
  - API integrations in `src/api/lists.ts`.
  - Scrollable columns rendering lists in `BoardPage`.
  - Optimistic UI updates for adding lists, list deletions, and title renames.
  - Accessibiliy-polish for lists management.

---

## **24. Cards CRUD System**

Fully implemented cards across backend and frontend:

- **Backend**:
  - `CardEntity`, repository, DTOs, service, and controller.
  - Board-scoped card listing.
  - Create, rename/update, move across lists, reorder, and delete.
  - Double-precision position spacing with compaction support.
- **Frontend**:
  - API integrations in `src/api/cards.ts`.
  - Card rendering in list columns.
  - Add-card form, inline title editing, delete support, and optimistic drag updates.

---

## **25. Drag & Drop Reordering**

- Integrated `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities`.
- Supports horizontal list reordering.
- Supports card reordering within a list and moving cards between lists.
- Persists new positions through list/card PATCH endpoints.

---

## **26. Realtime Synchronization**

- Backend exposes SockJS/STOMP endpoint at `/ws`.
- Board mutations publish events to `/topic/boards/{boardId}`.
- WebSocket subscriptions are protected by the same JWT cookie and board-access checks.
- Frontend subscribes per board and invalidates board/list/card/member queries when events arrive.

---

## **27. Board Members & Collaborators**

- Added `board_members` schema and backend package.
- Board owners can add collaborators by email, list members, and remove non-owner members.
- Board listing and board access now include owned boards and boards shared with the user.
- Frontend includes member chips and an invite-by-email form on the board page.

---

## **28. Security Hardening**

- Access JWT stored in an HttpOnly, Secure, SameSite=Strict cookie.
- Refresh token stored in an HttpOnly, Secure, SameSite=Strict cookie scoped to `/api/auth`.
- Refresh tokens are opaque, hashed in the database, revoked on logout, and rotated on refresh.
- Login/register endpoints are rate limited per client IP.
- Spring Security requires HTTPS and sends HSTS headers.
- Database startup validation rejects PostgreSQL JDBC URLs without `sslmode=require`, `sslmode=verify-ca`, or `sslmode=verify-full`.

---

# Architecture Overview

```
fast-trello-mvp/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   ├── utils/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── main.tsx
│
└── backend/
    ├── src/main/java/com/trello/backend/
    │   ├── auth/
    │   ├── board/
    │   ├── boardmember/
    │   ├── card/
    │   ├── config/
    │   ├── common/
    │   ├── list/
    │   ├── realtime/
    │   └── BackendApplication.java
    │
    ├── src/main/resources/
    │   ├── application.properties
    │   └── db/migration/
    │
    └── pom.xml
```

---

# Running the Project

### **Backend**

```bash
cd backend
set -o allexport; source .env.backend; set +o allexport
./mvnw spring-boot:run
```

The backend now enforces HTTPS. Run it behind a TLS-terminating proxy or configure local HTTPS for end-to-end browser testing.

`https://localhost:8080` or your proxy HTTPS origin

---

### **Frontend**

```
cd frontend
npm install
npm run dev
```

`http://localhost:5173`

Because auth cookies are marked `Secure`, browser authentication requires an HTTPS backend origin.

---

# Roadmap (Upcoming)

- Dedicated local test profile/database.
- Production-ready distributed rate limiting if multiple backend instances are deployed.
- More detailed card modal and activity history.
- Push/pull conflict handling for concurrent drag operations.

---

# License

MIT License.
