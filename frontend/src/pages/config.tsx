import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { LayoutContext } from "../components/AppLayout";
import { Button, Card, Field, Notice } from "../components/ui";
import { errorMessage } from "../lib/format";
import {
  deleteUser,
  logout,
  updateUser,
} from "../services/user/userService";
import { GUEST_EMAIL } from "../types";

function ConfigPage() {
  const { user, refreshUser } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string }>();
  const [saving, setSaving] = useState(false);

  if (user.email === GUEST_EMAIL) {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Você está como visitante</h1>
          <p className="text-muted">
            A conta de visitante é somente leitura. Crie sua própria conta para
            editar seus dados.
          </p>
          <Button
            className="self-start"
            onClick={() => {
              logout();
              navigate("/register");
            }}
          >
            Criar minha conta
          </Button>
        </Card>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(undefined);
    setSaving(true);

    try {
      await updateUser(user.id, { name, email, password });
      await refreshUser();
      setName("");
      setEmail("");
      setPassword("");
      setStatus({ kind: "ok", text: "Dados atualizados com sucesso." });
    } catch (err) {
      setStatus({
        kind: "error",
        text: errorMessage(err, "Não foi possível atualizar os dados."),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza? Sua conta será apagada permanentemente.")) {
      return;
    }

    try {
      await deleteUser(user.id);
      logout();
      navigate("/login");
    } catch (err) {
      setStatus({
        kind: "error",
        text: errorMessage(err, "Não foi possível apagar a conta."),
      });
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <Card>
        <h2 className="mb-1 font-semibold">Dados da conta</h2>
        <p className="mb-4 text-sm text-muted">
          Deixe em branco o que não quiser alterar.
        </p>
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <Field
            label="Nome"
            placeholder={user.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Field
            label="E-mail"
            type="email"
            placeholder={user.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {status && <Notice kind={status.kind}>{status.text}</Notice>}
          <Button type="submit" disabled={saving} className="self-start">
            {saving ? "Salvando…" : "Salvar alterações"}
          </Button>
        </form>
      </Card>

      <Card className="border-danger/30">
        <h2 className="mb-1 font-semibold text-danger">Zona de perigo</h2>
        <p className="mb-4 text-sm text-muted">
          Apagar a conta remove seus dados de acesso. Essa ação não pode ser
          desfeita.
        </p>
        <Button variant="danger" onClick={handleDelete}>
          Apagar minha conta
        </Button>
      </Card>
    </div>
  );
}

export default ConfigPage;
