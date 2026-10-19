import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/user/userService";
import { GUEST_EMAIL, type User } from "../types";
import { Spinner } from "./ui";

export interface LayoutContext {
  user: User;
  refreshUser: () => Promise<void>;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-surface-2 text-ink"
      : "text-muted hover:bg-surface hover:text-ink"
  }`;

export default function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = useCallback(async () => {
    setUser(await getUser());
  }, []);

  useEffect(() => {
    getUser()
      .then(setUser)
      .catch(() => {
        // 401 já é tratado no interceptor; qualquer outro erro volta ao login.
        logout();
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const isGuest = user.email === GUEST_EMAIL;

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-line bg-surface md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex flex-col gap-4 p-4 md:h-full md:p-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              🌤️
            </span>
            <div>
              <p className="font-bold leading-tight">Clima GDASH</p>
              <p className="text-xs text-muted">São João del-Rei · MG</p>
            </div>
          </div>

          <nav
            aria-label="Principal"
            className="flex gap-1 md:flex-1 md:flex-col"
          >
            <NavLink to="/home" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/config" className={linkClass}>
              Configurações
            </NavLink>
          </nav>

          <div className="flex items-center justify-between gap-3 md:flex-col md:items-stretch">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <div className="flex gap-2 md:flex-col">
              {isGuest && (
                <button
                  onClick={() => {
                    logout();
                    navigate("/register");
                  }}
                  className="cursor-pointer rounded-xl bg-accent-strong px-3 py-2 text-sm font-semibold text-white hover:bg-accent"
                >
                  Criar conta
                </button>
              )}
              <button
                onClick={handleLogout}
                className="cursor-pointer rounded-xl border border-line px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet context={{ user, refreshUser } satisfies LayoutContext} />
      </main>
    </div>
  );
}
