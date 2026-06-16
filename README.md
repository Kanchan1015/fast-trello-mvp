# Fast Trello MVP

A lightweight Trello-style board app built with **Spring Boot**, **React (Vite + TypeScript)**, **Neon PostgreSQL**, **Flyway**, and **JWT Authentication**.
Designed with clean architecture and minimal, well-structured features.

---

# Tech Stack

### **Frontend**

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-fast-purple?logo=vite)
![React Query](https://img.shields.io/badge/React_Query-Server_State-red?logo=reactquery)
![Axios](https://img.shields.io/badge/Axios-HTTP-orange?logo=axios)
![Tailwind](https://img.shields.io/badge/TailwindCSS-Utility_CSS-38B2AC?logo=tailwindcss)

### **Backend**

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-green?logo=springboot)
![Spring Security](https://img.shields.io/badge/Security-JWT-green?logo=springsecurity)
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
  common/
  config/
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

- Flyway verified through logs & Neon console

---

## **5. Spring Security Configuration**

- Stateless JWT authentication

- Completely configured filter chain with:

  - `JwtAuthenticationFilter`
  - Password encoder (BCrypt)
  - AuthEntryPoint
  - UserDetailsService

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

- `JwtService` for issuing + validating tokens
- HMAC signing (HS256)
- Expiry handling
- `JwtAuthenticationFilter` loads user into SecurityContext
- Integrated into security chain

---

## **9. Authentication API**

Auth endpoints implemented:

| Method | Endpoint             | Description                            |
| ------ | -------------------- | -------------------------------------- |
| POST   | `/api/auth/register` | Register new user, return token + user |
| POST   | `/api/auth/login`    | Login user, return token + user        |
| GET    | `/api/auth/me`       | Fetch authenticated user               |

Structured error messages + validation included.

---

## **10. Token Storage & Axios Interceptors**

- Token stored with helpers:

  ```
  getToken()
  setToken()
  clearToken()
  ```

- Axios instance automatically attaches JWT
- Handles 401 → clear token + route to login

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
- Logout clears token + context
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

## **21. Board Page Route Stub**

Added route:

```
/boards/:id
```

Implemented `BoardPage`:

- Fetches board data
- Shows loading/error states
- Header + created date
- Placeholder for lists/cards (Day 5)

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
  - Security check integration scoping lists to parent board ownership.
- **Frontend**:
  - API integrations in `src/api/lists.ts`.
  - Scrollable columns rendering lists in `BoardPage`.
  - Optimistic UI updates for adding lists, list deletions, and title renames.
  - Accessibiliy-polish for lists management.

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
    │   ├── config/
    │   ├── common/
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

`http://localhost:8080`

---

### **Frontend**

```
cd frontend
npm install
npm run dev
```

`http://localhost:5173`

---

# Roadmap (Upcoming)

### **Next: Cards System & Enhancements**

- Card CRUD (JPA entities, services, controllers, and APIs)
- Drag & Drop cards/lists using `@dnd-kit`
- Real-time sync (WebSockets)
- Full card management UI modal

---

# License

MIT License.
