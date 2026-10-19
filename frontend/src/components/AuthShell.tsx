import type { ReactNode } from "react";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#16315a_0%,var(--color-bg)_60%)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-3 text-5xl" aria-hidden="true">
            🌤️
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface/90 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          {children}
        </div>
      </div>
    </main>
  );
}
