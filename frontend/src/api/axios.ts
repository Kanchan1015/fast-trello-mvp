// Central axios instance for the app.
// - attaches Authorization header when token present
// - handles 401 by clearing token and redirecting to login
// - central place for baseURL and timeout
// - adds the token to the api call every time

import axios, { AxiosError } from "axios";
import { getToken, clearToken } from "../utils/token";

// configure base URL from env, fallback to local backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15s timeout
  withCredentials: false, // set true if you use cookies later
});

// Request interceptor: attach token if exists
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 centrally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Clear token centrally so app state is consistent
      clearToken();

      // Optional: you may want to use a toast library here.
      // Example placeholder:
      // toast.error("Session expired — please sign in");

      // Redirect to login page. Using window.location is fine here
      // because this file is not inside a React component.
      // If you prefer programmatic navigation via react-router, expose
      // a central event emitter or store to let UI handle it.
      try {
        // prevent infinite loop if already on /login
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      } catch (e) {
        // fallback no-op
      }
    }
    return Promise.reject(error);
  }
);

export default api;
