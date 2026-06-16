// Centralized auth-related API calls.
// Mini note: separating API helpers from UI keeps components clean and testable.

import api from "./axios";

// --- Types ---
export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
};

// --- API Helpers ---

// Register user → returns { token, user }
export function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  return api
    .post<AuthResponse>("/api/auth/register", payload)
    .then((r) => r.data);
}

// Login → returns { token, user }
export function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>("/api/auth/login", payload).then((r) => r.data);
}

export function logoutApi(): Promise<void> {
  return api.post("/api/auth/logout").then(() => undefined);
}

export function refreshApi(): Promise<AuthResponse> {
  return api.post<AuthResponse>("/api/auth/refresh").then((r) => r.data);
}
