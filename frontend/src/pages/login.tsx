import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { Button, Field, Notice } from "../components/ui";
import { errorMessage } from "../lib/format";
import { login } from "../services/user/userService";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      setError(errorMessage(err, "Não foi possível entrar. Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  const fillGuest = () => {
    setEmail("visitante@gmail.com");
    setPassword("12345678");
  };

  return (
    <AuthShell
      title="Bem-vindo de volta"
      subtitle="Entre para ver o clima e os insights de IA"
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <Field
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Senha"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Notice kind="error">{error}</Notice>}
        <Button type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </Button>
        <Button type="button" variant="ghost" onClick={fillGuest}>
          Usar conta de visitante
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link
          to="/register"
          className="font-semibold text-accent hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
    </AuthShell>
  );
}

export default LoginPage;
