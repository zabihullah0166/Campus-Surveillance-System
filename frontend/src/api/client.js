import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cs_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cs_token");
      localStorage.removeItem("cs_role");
      localStorage.removeItem("cs_name");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = "Something went wrong") {
  return error.response?.data?.detail || error.response?.data?.message || error.message || fallback;
}
