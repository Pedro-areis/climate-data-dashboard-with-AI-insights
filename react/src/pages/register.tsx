import { useNavigate } from "react-router-dom";
import InitialPage from "../components/initialPage";
import { useState } from "react";
import { register } from "../services/user/userService";

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleBack = () => {
    navigate("/login");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);

      navigate("/home");
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      alert("Credenciais inválidas");
    }
  };

  return (
    <InitialPage title="Register">
      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 w-96 justify-center mt-14"
      >
        <label className="text-white">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          className="border rounded bg-gray-400 w-96 h-8 outline-0 text-white"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        />

        <label className="text-white">E-mail</label>
        <input
          type="e-mail"
          name="email"
          id="email"
          className="border rounded bg-gray-400 w-96 h-8 outline-0 text-white"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />

        <label className="text-white">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          className="border rounded bg-gray-400 w-96 h-8 outline-0 text-white"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />

        <div className="flex flex-col gap-4 mt-4 justify-center items-center">
          <button
            type="submit"
            className="border rounded bg-gray-400 cursor-pointer
                        hover:bg-gray-500 w-40 h-10 mt-6 text-white"
          >
            Register
          </button>
          <button
            type="button"
            className="border rounded bg-gray-400 cursor-pointer
                        hover:bg-gray-500 w-40 h-10 text-white"
            onClick={handleBack}
          >
            Back to Login
          </button>
        </div>
      </form>
    </InitialPage>
  );
}

export default RegisterPage;
