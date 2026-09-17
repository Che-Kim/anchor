import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[2px] font-medium transition-[background-color,border-color,color,transform] duration-100 active:translate-y-px disabled:pointer-events-none disabled:opacity-40";

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-2",
  secondary:
    "border border-rule-strong bg-transparent text-ink hover:border-ink hover:bg-paper-2",
  ghost: "text-ink-2 hover:bg-paper-2 hover:text-ink",
  danger: "border border-signal/40 bg-transparent text-signal hover:bg-signal-wash",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <Link
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
