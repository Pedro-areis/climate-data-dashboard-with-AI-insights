import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/user/userService";
import { useEffect, useState } from "react";

function NavBar() {
  interface User {
    name: string;
    email: string;
  }

  const navigate = useNavigate();
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
  });

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDashboard = () => {
    navigate("/home");
  };

  const handlleRegister = () => {
    localStorage.removeItem("token");
    navigate("/register");
  };

  const handleConfig = () => {
    navigate("/config");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const newUser = await getUser();
        setUser(newUser);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <nav className="bg-neutral-600 w-1/5 h-screen rounded-2xl">
      <h1 className="w-full p-2 text-white text-center text-2xl">
        Analise Climática
      </h1>
      <p className="w-full p-2 text-white text-center text-sm">
        Cidade: São João del Rei
      </p>

      <div className="flex flex-col gap-4 mt-4 items-center h-10/12">
        <button
          className="bg-neutral-500 w-80 h-17 p-2 text-white rounded-2xl hover:bg-neutral-700 cursor-pointer mt-25"
          onClick={handleDashboard}
        >
          Dashboard
        </button>
        <button
          className="bg-neutral-500 w-80 h-17 p-2 text-white rounded-2xl hover:bg-neutral-700 cursor-pointer mt-8"
          onClick={handleConfig}
        >
          Confingurações
        </button>
        <button
          className="bg-neutral-500 w-80 h-17 p-2 text-white rounded-2xl hover:bg-neutral-700 cursor-pointer mt-8"
          onClick={handleLogout}
        >
          Sair
        </button>
        {user.email === "visitante@gmail.com" ? (
          <>
            <button
              className="bg-neutral-500 w-80 h-17 p-2 text-white rounded-2xl hover:bg-neutral-700 cursor-pointer mt-auto"
              onClick={() => {
                handlleRegister();
              }}
            >
              Faça seu cadastro
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}

export default NavBar;
