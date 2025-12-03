// small shared axios instance (mini-note: centralizes base URL + headers)
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  withCredentials: false, // change if you move to cookies later
});

export default api;
