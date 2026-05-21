import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  full = false,
  disabled = false,
  type = "button"
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "ghost";
  full?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}${full ? " btn-full" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function Pill({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented">
      {options.map((option) => (
        <button
          key={String(option.value)}
          className={`seg-btn${option.value === value ? " seg-btn-active" : ""}`}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ScreenTitle({
  title,
  subtitle,
  onBack
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <header className="screen-head">
      {onBack ? (
        <button className="link-btn" onClick={onBack} type="button">
          ← Back
        </button>
      ) : (
        <span className="screen-head-spacer" />
      )}
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}
