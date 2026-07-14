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
