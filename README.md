# Fast Trello MVP

A lightweight Trello-style board app built with **Spring Boot**, **React (Vite + TypeScript)**, **Neon PostgreSQL**, **Flyway**, and soon **JWT Authentication**.
Designed as an **interview-ready MVP** with a clean architecture and minimal, well-structured features.

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

# Current Progress

## Completed

### **1. Workspace Setup**

- Repo initialized with `frontend/` and `backend/`
- Tools verified (Node, Java, Maven)

### **2. Frontend Setup**

- Vite + React + TypeScript project created
- Installed essential libs:

  - React Router
  - React Query
  - Axios
  - Tailwind (optional)

- Added basic routes + pages (Login, Dashboard, Board)
- Folder structure established

### **3. Backend Setup**

- Spring Boot generated with:

  - Web, Security, JPA, Validation
  - PostgreSQL Driver
  - Flyway

### **4. Database Setup**

- Neon PostgreSQL connected successfully
- `flyway-core` configured
- Initial migration added:

  - `users`
  - `boards`
  - `lists`
  - `cards`

- Flyway migration validated in Neon dashboard

### **5. Spring Security Base Setup**

- Security **enabled**, not disabled
- Stateless mode for future JWT
- Public routes:

  - `/health`
  - `/api/auth/**`

- Added password encoder + CORS config

### **6. Health Endpoint**

- `/health` returns:

  ```json
  { "status": "UP" }
  ```

---

# Architecture Overview

```
fast-trello-mvp/
│
├── frontend/                       # Vite + React + TS
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── main.tsx
│   └── package.json
│
└── backend/                        # Spring Boot
    ├── src/main/java/com/trello/backend/
    │   ├── config/                 # SecurityConfig, CORS, JWT filters later
    │   ├── common/                 # HealthController, shared utils
    │   ├── auth/                   # (upcoming) User, AuthController, JWT
    │   ├── board/                  # (upcoming) boards/lists/cards logic
    │   └── BackendApplication.java
    │
    ├── src/main/resources/
    │   ├── application.properties
    │   └── db/migration/           # Flyway V1__init.sql
    │
    └── pom.xml
```

---

# Running the Project

## Backend

### **1. Load environment variables**

(Your DB credentials should be stored safely in `.env.backend` and added to `.gitignore`)

```bash
set -o allexport; source .env.backend; set +o allexport
```

### **2. Start backend**

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs at: **[http://localhost:8080](http://localhost:8080)**

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **[http://localhost:5173](http://localhost:5173)**

---

# 🗺️ Roadmap (Next Steps)

### 🔜 **7. Authentication Module (In Progress Next)**

- User entity (UUID-based)
- BCrypt password hashing
- Register endpoint (`POST /api/auth/register`)
- Login endpoint (`POST /api/auth/login`)
- JWT generation & validation
- Security filter chain update for JWT

### 🔜 **8. Boards / Lists / Cards**

- CRUD APIs for boards, lists, cards
- Position-based ordering
- React Query integration on frontend

### 🔜 **9. Drag & Drop (Frontend)**

- Implement DnD via `@dnd-kit`
- Apply optimistic updates
- Persist card/list order

### 🔜 **10. Realtime Sync**

- WebSocket or Server-Sent Events (SSE)
- Multi-user live board updates

### 🔜 **11. Deployment**

- Frontend → Vercel / Netlify
- Backend → Railway / Render
- DB → Neon (already done)

---

# Contributing

This project is built for learning — clean code, readable commits, small features, and clear architecture are encouraged.

---

# License

MIT License.
