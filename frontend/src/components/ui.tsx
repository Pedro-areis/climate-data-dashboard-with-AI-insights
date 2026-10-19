import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-line bg-surface p-5 ${className}`}
    >
      {children}
    </section>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-accent-strong text-white hover:bg-accent",
  ghost: "border border-line text-ink hover:bg-surface-2",
  danger: "border border-danger/50 text-danger hover:bg-danger/10",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}

export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-muted">
      {label}
      <input
        {...props}
        className="rounded-xl border border-line bg-bg px-3.5 py-2.5 text-base text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
      />
    </label>
  );
}

export function Notice({
  kind,
  children,
}: {
  kind: "error" | "ok";
  children: ReactNode;
}) {
  const style =
    kind === "error"
      ? "border-danger/40 bg-danger/10 text-danger"
      : "border-ok/40 bg-ok/10 text-ok";
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-xl border px-3.5 py-2.5 text-sm ${style}`}
    >
      {children}
    </p>
  );
}

export function Spinner({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-muted" role="status">
      <span className="size-4 animate-spin rounded-full border-2 border-line border-t-accent" />
      {label}
    </div>
  );
}
