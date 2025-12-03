# 🚀 Fast Trello MVP

A lightweight Trello-style board app built with **Spring Boot**, **React (Vite + TypeScript)**, **Neon PostgreSQL**, **Flyway**, and now **JWT Authentication**.
Designed as an **interview-ready MVP** with clean architecture and minimal, well-structured features.

---

# 🛠️ Tech Stack

### **Frontend**

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-fast-purple?logo=vite)
![React Query](https://img.shields.io/badge/React_Query-Server_State-red?logo=reactquery)

### **Backend**

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-green?logo=springboot)
![Spring Security](https://img.shields.io/badge/Security-JWT-green?logo=springsecurity)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-red?logo=flyway)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?logo=postgresql)

---

# 📦 Current Progress

## ✅ Completed

### **1. Workspace Setup**

- Repo initialized with `frontend/` and `backend/`
- Tools verified (Node, Java, Maven)

---

### **2. Frontend Setup**

- Vite + React + TypeScript project created
- Installed essential libs:

  - React Router
  - React Query
  - Axios
  - Tailwind (optional)

- Added routes + basic pages (Login, Dashboard, Board)
- Clean folder structure created

---

### **3. Backend Setup**

- Spring Boot generated with:

  - Web
  - Security
  - JPA
  - Validation
  - PostgreSQL Driver
  - Flyway

---

### **4. Database Setup**

- Connected backend to Neon PostgreSQL
- Added Flyway migration `V1__init.sql` defining:

  - `users`
  - `boards`
  - `lists`
  - `cards`

- Migrations applied successfully

---

### **5. Spring Security Base Setup**

- Security **enabled**, not disabled
- Stateless session mode configured
- Public endpoints:

  - `/health`
  - `/api/auth/**`

- CORS enabled for frontend (`http://localhost:5173`)
- Added `BCryptPasswordEncoder`

---

### **6. Health Endpoint**

- `/health` returns:

  ```json
  { "status": "UP" }
  ```

---

### **7. User Domain & Auth Service (Completed)**

- Added `User` JPA entity mapping to `users` table
- Added `UserRepository` with `findByEmail` and `existsByEmail`
- Added DTOs:

  - `RegisterRequest`
  - `LoginRequest`
  - `UserDto`
  - `AuthResponse`

- Added `AuthService`:

  - Handles register (hash password, save user, create JWT)
  - Handles login (verify bcrypt hash, create JWT)
  - Provides `getCurrentUser()` through SecurityContext

- Added custom exceptions for clean error handling

---

### **8. JWT Generation & Validation (Completed)**

- Implemented `JwtService`:

  - Creates tokens (HS256)
  - Validates tokens with small clock skew
  - Stores secret & expiry in environment variables

- Added `JwtAuthenticationFilter`:

  - Reads `Authorization: Bearer <token>`
  - Validates JWT and populates `SecurityContext`

- Updated `SecurityConfig`:

  - Adds JWT filter before default auth filter
  - Ensures `/api/auth/**` and `/health` are open
  - All other endpoints require a valid token
  - CORS allowed for frontend

---

### **9. Authentication Controller (Completed)**

Added `/api/auth` controller with endpoints:

| Method | Endpoint             | Description                                   |
| ------ | -------------------- | --------------------------------------------- |
| POST   | `/api/auth/register` | Registers user, returns `{ token, user }`     |
| POST   | `/api/auth/login`    | Authenticates user, returns `{ token, user }` |
| GET    | `/api/auth/me`       | Returns current user (protected)              |

Additional:

- Added request validation (`@Valid`)
- Added `GlobalExceptionHandler` for clean error responses:

  - Duplicate email → 400
  - Invalid credentials → 401
  - Validation errors → 400

---

### **10. Frontend Integration Notes (Completed)**

- Store token in `localStorage` or `sessionStorage` (MVP)
- Axios interceptor should attach `Authorization: Bearer <token>`
- On app load:

  - If token exists → call `/api/auth/me`

- Protected routes:

  - Redirect to `/login` when no token or user invalid

- Handle token expiration and auth errors elegantly

---

# 🧱 Architecture Overview

```
fast-trello-mvp/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── main.tsx
│   └── package.json
│
└── backend/
    ├── src/main/java/com/trello/backend/
    │   ├── config/                 # SecurityConfig, CORS, JWT filter
    │   ├── common/                 # HealthController
    │   ├── auth/                   # User, AuthService, AuthController, DTOs, JWT
    │   ├── board/                  # (upcoming) boards/lists/cards logic
    │   └── BackendApplication.java
    │
    ├── src/main/resources/
    │   ├── application.properties
    │   └── db/migration/           # V1__init.sql
    │
    └── pom.xml
```

---

# ▶️ Running the Project

## Backend

### **1. Load env vars**

```bash
set -o allexport; source .env.backend; set +o allexport
```

### **2. Start backend**

```bash
cd backend
./mvnw spring-boot:run
```

Backend: **[http://localhost:8080](http://localhost:8080)**

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: **[http://localhost:5173](http://localhost:5173)**

---

# 🗺️ Updated Roadmap

### ✅ **Day 1 & Day 2: Backend Auth + Security Completed**

### 🔜 **Next Major Steps (Day 3 onward)**

### **1. Board API (Create, List, Delete)**

- User-owned boards
- Basic CRUD
- `/api/boards/**` (protected)

### **2. List & Card APIs**

- Add list to board
- Add card to list
- Reorder lists & cards (position index)

### **3. Drag & Drop (Frontend)**

- Use `@dnd-kit`
- Optimistic updates
- Real backend persistence

### **4. Realtime Sync**

- WebSocket or SSE
- Live card movement updates

### **5. Deployment**

- Frontend → Vercel / Netlify
- Backend → Railway / Render
- DB → Neon

---

# 🤝 Contributing

Clean code, readable commits, and modular architecture keep this project learning-focused and easy to extend.

---

# 📄 License

MIT License.
