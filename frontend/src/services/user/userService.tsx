import { api } from "../api";

interface User {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
}

export async function login(email: string, password: string) {
  const response = await api.post("/users/login", {
    email,
    password,
  });

  localStorage.setItem("token", response.data.token);
}

export async function register(name: string, email: string, password: string) {
  await api.post("/users/register", { name, email, password });

  await login(email, password);
}

export async function logout() {
  localStorage.removeItem("token");
}

export async function getUser() {
  const response = await api.get("/users/me");
  return response.data;
}

export async function updateUser(id: string, data: User) {
  const response = await api.patch(`/users/update/${id}`, data);

  return response.data;
}

export async function deleteUser(id: string) {
  await api.delete(`/users/delete/${id}`);
}
