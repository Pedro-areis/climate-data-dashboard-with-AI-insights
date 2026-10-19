import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { Button, Field, Notice } from "../components/ui";
import { errorMessage } from "../lib/format";
import { register } from "../services/user/userService";

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(name, email, password);
      navigate("/home");
    } catch (err) {
      setError(errorMessage(err, "Não foi possível criar a conta."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Criar conta" subtitle="Leva menos de um minuto">
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <Field
          label="Nome"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Senha (mínimo 8 caracteres)"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Notice kind="error">{error}</Notice>}
        <Button type="submit" disabled={loading}>
          {loading ? "Criando…" : "Criar conta"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}

export default RegisterPage;
