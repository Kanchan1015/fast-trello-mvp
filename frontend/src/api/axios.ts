// frontend/src/api/axios.ts
// Central axios instance for the app.
// - attaches Authorization header when token present
// - handles 401 by clearing token, emitting logout event, showing toast and redirecting to login
// - central place for baseURL and timeout
// - adds the token to the api call every time

import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

// configure base URL from env, fallback to local backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15s timeout
  withCredentials: true,
});

// Response interceptor: handle 401 centrally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // If the server didn't respond (network error), show a friendly toast
    if (!error.response) {
      // Avoid spamming toasts for repeated network failures
      toast.error("Network error — please check your connection.");
      return Promise.reject(error);
    }

    const status = error.response.status;

    if (status === 401) {
      // Notify any UI listeners (AuthProvider or other) about logout.
      // Listeners can do client-side cleanup, redirect, or show modals.
      try {
        window.dispatchEvent(
          new CustomEvent("auth:logout", { detail: { reason: "unauthorized" } })
        );
      } catch {
        // ignore
      }

      // Show a friendly toast
      toast.error("Session expired — please sign in");

      // Redirect to login page if not already there
      try {
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      } catch {
        // fallback no-op
      }
    }

    return Promise.reject(error);
  }
);

export default api;
