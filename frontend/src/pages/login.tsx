import { login } from "../services/user/userService";
import InitialPage from "../components/initialPage";

import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("visitante@gmail.com");
  const [password, setPassword] = useState<string>("12345678");

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      navigate("/home");
    } catch (error) {
      setEmail("visitante@gmail.com");
      setPassword("12345678");
      alert("Usuário ou senha inválidos");
      console.log(error);
    }
  };

  return (
    <>
      <InitialPage title="Login">
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4 w-96 justify-center mt-14"
        >
          <label className="text-white">E-mail</label>
          <input
            type="e-mail"
            name="email"
            id="email"
            className="border rounded bg-gray-400 w-96 h-8 outline-0 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="text-white">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            className="border rounded bg-gray-400 w-96 h-8 outline-0 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-col gap-4 mt-4 justify-center items-center">
            <button
              type="submit"
              className="border rounded bg-gray cursor-pointer
                         hover:bg-gray-600 w-40 h-10 mt-6 text-white"
            >
              Login
            </button>
            <button
              type="button"
              className="border rounded bg-gray cursor-pointer
                         hover:bg-gray-600 w-40 h-10 text-white"
              onClick={handleRegister}
            >
              Register
            </button>
          </div>
        </form>
      </InitialPage>
    </>
  );
}

export default LoginPage;
