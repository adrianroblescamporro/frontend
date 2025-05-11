import axios from "axios";

// Definición de la API a la que se conecta el frontend
const API_URL = "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Añadir token a cada solicitud si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejo global de errores (expiración del token, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("tokenExpired"));
    }
    return Promise.reject(error);
  }
);
