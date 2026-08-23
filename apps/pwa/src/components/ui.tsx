// Gece Matbaasi temel bilesenleri. Sabit hex YASAK — hepsi token siniflari (tailwind.config.ts).
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`animate-stagger-in border border-hairline bg-surface rounded p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function Divider() {
  return <hr className="border-0 border-t border-hairline my-4" />;
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 border border-accent-deep text-accent text-xs tracking-tight px-2 py-0.5 rounded">
      {children}
    </span>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };
export function Button({ variant = "primary", className = "", children, ...rest }: BtnProps) {
  const base =
    "relative overflow-hidden rounded px-4 py-2.5 text-sm font-medium transition-colors duration-200 ease-out1 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-accent-fill text-text hover:bg-accent-deep border border-accent-deep"
      : "bg-transparent text-text-dim hover:text-text border border-hairline";
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-transparent border border-hairline rounded px-3 py-2.5 text-sm text-text placeholder:text-text-faint outline-none focus:border-accent-deep transition-colors ${className}`}
      {...rest}
    />
  );
}

export function LedgerRow({
  ts,
  channel,
  sen,
  sistem,
  sensitive,
}: {
  ts: string;
  channel: string;
  sen: string | null;
  sistem: string | null;
  sensitive: boolean;
}) {
  const stamp = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
  return (
    <div
      className={`animate-stagger-in border-t border-hairline py-3 flex gap-3 ${
        sensitive ? "border-l-2 border-l-accent-deep pl-2" : ""
      }`}
    >
      <div className="shrink-0 w-24">
        <div className="text-xs text-text-faint tabular-nums">{stamp}</div>
        <div className="mt-1">
          <Badge>{channel}</Badge>
        </div>
      </div>
      <div className="min-w-0 text-sm">
        {sen && <div className="text-text">Sen: {sen}</div>}
        {sistem && <div className="text-text-dim">Sistem: {sistem}</div>}
      </div>
    </div>
  );
}
