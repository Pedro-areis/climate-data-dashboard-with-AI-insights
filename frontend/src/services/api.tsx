import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token expirado/inválido em rota protegida: limpa a sessão e volta ao login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error.config?.url?.includes("/users/login");
    if (error.response?.status === 401 && !isLoginCall) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);
