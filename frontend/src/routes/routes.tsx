import { Routes, Route, BrowserRouter } from "react-router-dom";
import LoginPage from "../pages/login";
import RegisterPage from "../pages/register";
import HomePage from "../pages/home";
import ConfigPage from "../pages/config";

function isAutenticated() {
  const token = localStorage.getItem("token");
  return !!token;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/home"
          element={isAutenticated() ? <HomePage /> : <LoginPage />}
        />
        <Route
          path="/config"
          element={isAutenticated() ? <ConfigPage /> : <LoginPage />}
        />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
