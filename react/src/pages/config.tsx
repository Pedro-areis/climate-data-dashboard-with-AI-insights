import { useEffect, useState } from "react";
import NavBar from "../components/nav";
import {
  deleteUser,
  getUser,
  register,
  updateUser,
} from "../services/user/userService";
import ComponentConfig from "../components/componentConfig";
import { useNavigate } from "react-router-dom";

function ConfigPage() {
  interface User {
    id: string;
    name: string;
    email: string;
    password: string;
  }

  const [user, setUser] = useState<User>({
    id: "",
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(newName, newEmail, newPassword);
      alert("Usuário cadastrado com sucesso");
      navigate("/home");
    } catch (error) {
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      console.error("Erro ao registrar usuário:", error);
      alert("Credenciais inválidas, preencha corretamente!");
    }
  };

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState(user.password);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name,
        email,
        password,
      };
      await updateUser(user.id, data);

      setName("");
      setEmail("");
      setPassword("");

      alert("Usuário atualizado com sucesso");
    } catch (error) {
      setName("");
      setEmail("");
      setPassword("");
      console.error("Erro ao atualizar o usuário:", error);
      alert("Credenciais inválidas, preencha corretamente!");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(user.id);
      alert("Usuário deletado com sucesso");

      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Erro ao deletar o usuário:", error);
    }
  };

  useEffect(() => {
    const handleUser = async () => {
      const dataUser = await getUser();

      setUser(dataUser);
    };

    handleUser();
  }, []);

  return (
    <main className="flex flex-row h-screen bg-neutral-500 flex-wrap">
      <NavBar />
      <div className="flex flex-col h-screen w-4/5 items-center justify-center bg-neutral-700 rounded-2xl">
        {user.email == "visitante@gmail.com" ? (
          <ComponentConfig title="Faça seu cadastro" H1className="">
            <p className="position-absolute text-white mb-auto">
              Você ainda não possui uma conta, faça seu registro!
            </p>
            <label htmlFor="name" className="text-white">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewName(e.target.value)
              }
              className="border rounded-xl bg-neutral-700 w-96 h-9 outline-0 p-3 items-center text-white"
            />
            <label htmlFor="email" className="text-white">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={newEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewEmail(e.target.value)
              }
              className="border rounded-xl bg-neutral-700 w-96 h-9 outline-0 p-3 items-center text-white"
            />
            <label htmlFor="password" className="text-white">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewPassword(e.target.value)
              }
              className="border rounded-xl bg-neutral-700 w-96 h-9 outline-0 p-3 items-center text-white mb-auto"
            />

            <button
              className="border rounded-xl bg-gray cursor-pointer
                          hover:bg-gray-600 w-40 h-10 mt-6 text-white"
              onClick={handleRegister}
            >
              Criar conta
            </button>
          </ComponentConfig>
        ) : (
          <ComponentConfig
            title="Configurações de usuário"
            H1className="mb-auto"
          >
            <label htmlFor="name" className="text-white">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              className="border rounded-xl bg-neutral-700 w-96 h-9 outline-0 p-3 items-center text-white"
            />
            <label htmlFor="email" className="text-white">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className="border rounded-xl bg-neutral-700 w-96 h-9 outline-0 p-3 items-center text-white"
            />
            <label htmlFor="password" className="text-white">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className="border rounded-xl bg-neutral-700 w-96 h-9 outline-0 p-3 items-center text-white mb-auto"
            />

            <button
              className="border rounded-xl bg-gray cursor-pointer
                          hover:bg-gray-600 w-40 h-10 mt-6 text-white"
              onClick={handleUpdate}
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              className="border rounded-xl bg-gray cursor-pointer
                          hover:bg-red-400 w-40 h-10 mt-6 text-white"
              onClick={handleDelete}
            >
              Deletar Conta
            </button>
          </ComponentConfig>
        )}
      </div>
    </main>
  );
}

export default ConfigPage;
