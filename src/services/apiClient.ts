import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token?: string) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}
