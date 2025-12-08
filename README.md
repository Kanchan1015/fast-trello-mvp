# Fast Trello MVP

A lightweight Trello-style board app built with **Spring Boot**, **React (Vite + TypeScript)**, **Neon PostgreSQL**, **Flyway**, and **JWT Authentication**.
Designed as an **interview-ready MVP** with clean architecture and minimal, well-structured features.

---

# Tech Stack

### **Frontend**

![React](https://img.shields.io/badge/React-18-blue?logo=react)
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
- Installed:

  - React Router
  - React Query
  - Axios
  - TailwindCSS (optional)

- Created folder structure:

  ```
  src/
    pages/
    components/
    api/
    utils/
    context/
  ```

- Added base routes & placeholder pages (Login, Signup, Dashboard, Board)

---

## **3. Backend Setup (Spring Boot)**

- Generated project with:

  - Spring Web
  - Spring Security
  - Spring Data JPA
  - Validation
  - PostgreSQL Driver
  - Flyway

- Basic package layout created:

  ```
  com.trello.backend.auth
  com.trello.backend.common
  com.trello.backend.config
  ```

---

## **4. Database Integration (Neon + Flyway)**

- Connected to Neon PostgreSQL using environment variables

- Added initial migration `V1__init.sql` creating:

  - `users`
  - `boards`
  - `lists`
  - `cards`

- Confirmed Flyway runs cleanly on startup

---

## **5. Spring Security Configuration**

- Security enabled (not disabled)
- Stateless authentication with JWT
- CORS enabled for `http://localhost:5173`
- Public endpoints:

  - `/health`
  - `/api/auth/**`

- All other endpoints require JWT
- Registered `BCryptPasswordEncoder`

---

## **6. Health Endpoint**

`GET /health` returns:

```json
{ "status": "UP" }
```

---

## **7. User Model, DTOs & Auth Service**

Implemented complete backend authentication flow:

- `User` JPA entity
- DTOs:

  - `RegisterRequest`
  - `LoginRequest`
  - `AuthResponse`
  - `UserDto`

- `UserRepository` with `findByEmail`, `existsByEmail`
- `AuthService`:

  - Registration (hash password, validate email)
  - Login (verify password)
  - `getCurrentUser()` from Spring SecurityContext

- Custom exceptions & global error handler

---

## **8. JWT Authentication System**

- Implemented `JwtService`:

  - Create & validate tokens
  - HS256 signing
  - Expiry management

- Implemented `JwtAuthenticationFilter`:

  - Reads Authorization header
  - Validates token
  - Populates SecurityContext

- Wired into `SecurityConfig` before default filters

---

## **9. Authentication API**

`/api/auth` endpoints:

| Method | Endpoint             | Description                              |
| ------ | -------------------- | ---------------------------------------- |
| POST   | `/api/auth/register` | Create account, return `{ token, user }` |
| POST   | `/api/auth/login`    | Authenticate & return `{ token, user }`  |
| GET    | `/api/auth/me`       | Get current authenticated user           |

Validation errors and auth failures return structured error responses.

---

## **10. Token Storage & Axios Interceptors**

Frontend now uses a unified token system:

### **Token Helpers (`utils/token.ts`):**

```
setToken()
getToken()
clearToken()
```

### **Axios instance**

- Attaches `Authorization: Bearer <token>`
- Handles 401:

  - Clears token
  - Shows toast (“Session expired”)
  - Redirects to `/login`

---

## **11. Frontend Authentication Experience (Login/Signup Pages)**

Implemented polished Login & Signup flows:

- Controlled inputs
- Inline validation (email, password, required fields)
- Server error display
- Disabled button during submission
- Autofocus + Enter key submit
- Toast notifications:

  - Login success
  - Signup success
  - Error feedback

---

## **12. App Bootstrap & Session Restore**

Added a complete `AuthProvider` using React Context + React Query:

- Restores session on startup when a token exists
- Fetches `/api/auth/me` to validate
- Shows loading splash during restore
- Prevents race conditions by updating context + React Query cache instantly after login

Context exposes:

```
user
isAuthenticated
loading
login(token, user)
logout()
```

---

## **13. Protected Routing**

Added `<RequireAuth />` wrapper:

- Guards protected pages:

  - `/dashboard`
  - `/boards/:id`

- Redirects unauthenticated users to `/login`
- Preserves intended URL (`location.state.from`)
- Shows splash screen during auth restore
- Prevents flashing protected content

---

## **14. Global Header & Sign-Out Button**

Added a simple `Header` component for authenticated layouts:

- Shows current user’s name
- “Sign out” button:

  - Clears token
  - Clears auth state
  - Redirects to `/login`
  - Shows toast confirmation

---

## **15. UX & Accessibility Polish**

- Added `react-hot-toast` for clean notifications
- Improved forms using:

  - `aria-invalid`
  - `aria-describedby`
  - `role="alert"`

- Focus management after navigation (`element.focus()`)
- Error states clearly communicated visually & via screen readers

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
│   │   ├── context/
│   │   └── main.tsx
│   └── package.json
│
└── backend/
    ├── src/main/java/com/trello/backend/
    │   ├── config/
    │   ├── common/
    │   ├── auth/
    │   ├── board/
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

1. Load environment variables:

```bash
set -o allexport; source .env.backend; set +o allexport
```

2. Start backend:

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs at:
➡️ [http://localhost:8080](http://localhost:8080)

---

### **Frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
➡️ [http://localhost:5173](http://localhost:5173)

---

# Roadmap (Upcoming)

### **Next Features**

- Board CRUD API + frontend
- Lists & Cards API
- Drag-and-drop (`@dnd-kit`)
- Optimistic updates
- Realtime sync (WebSocket/SSE)
- Deployment (Vercel + Render/Railway + Neon)

---

# License

MIT License.
