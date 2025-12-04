// auth API helpers (mini-note: keeps API calls separate from UI)
import api from "./axios";

export type RegisterPayload = { name: string; email: string; password: string };
export type LoginPayload = { email: string; password: string };

export type AuthResponse = {
  token: string;
  user: { id: string; name: string; email: string; createdAt: string };
};

export function registerApi(payload: RegisterPayload) {
  return api
    .post<AuthResponse>("/api/auth/register", payload)
    .then((r) => r.data);
}

// export function loginApi(payload: LoginPayload) {
//   return api.post<AuthResponse>("/api/auth/login", payload).then((r) => r.data);
// }

export function loginApi(payload: { email: string; password: string }) {
  console.log("loginApi called", payload);
  return api
    .post("/api/auth/login", payload)
    .then((r) => {
      console.log("loginApi response", r);
      return r.data;
    })
    .catch((err) => {
      console.error("loginApi error", err);
      throw err;
    });
}
