import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "dark" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-semibold uppercase tracking-[0.08em] transition-[background,color,border-color,transform,box-shadow] duration-300 ease-[var(--ease-expo)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-volt text-ink hover:bg-volt-soft hover:shadow-[0_10px_40px_-10px_rgb(200_255_46/0.6)]",
  outline: "border border-white/20 text-bone hover:border-volt hover:text-volt",
  ghost: "text-bone hover:bg-white/5",
  dark: "bg-bone text-ink hover:bg-white",
  danger: "bg-danger/90 text-white hover:bg-danger",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.68rem]",
  md: "h-12 px-6 text-xs",
  lg: "h-14 px-8 text-[0.8rem]",
};

type Common = { variant?: Variant; size?: Size; arrow?: boolean; className?: string; children: ReactNode; loading?: boolean };

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string }) {
  return cn(base, variants[variant], sizes[size], className);
}

function Inner({ children, arrow, loading }: Pick<Common, "children" | "arrow" | "loading">) {
  return (
    <>
      {loading && (
        <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      <span className="relative inline-flex items-center gap-2">{children}</span>
      {arrow && (
        <span aria-hidden className="relative inline-flex size-4 overflow-hidden">
          <ArrowUpRight className="size-4 transition-transform duration-300 ease-[var(--ease-expo)] group-hover/btn:translate-x-4 group-hover/btn:-translate-y-4" />
          <ArrowUpRight className="absolute inset-0 size-4 -translate-x-4 translate-y-4 transition-transform duration-300 ease-[var(--ease-expo)] group-hover/btn:translate-x-0 group-hover/btn:translate-y-0" />
        </span>
      )}
    </>
  );
}

export function Button({
  variant,
  size,
  arrow,
  className,
  children,
  loading,
  ...props
}: Common & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      data-cursor="click"
      className={buttonClasses({ variant, size, className })}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      <Inner arrow={arrow} loading={loading}>
        {children}
      </Inner>
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  arrow,
  className,
  children,
  href,
  external,
  ...props
}: Common & { href: string; external?: boolean } & Omit<ComponentProps<"a">, "href" | "children">) {
  const cls = buttonClasses({ variant, size, className });
  if (external) {
    return (
      <a data-cursor="click" href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props}>
        <Inner arrow={arrow}>{children}</Inner>
      </a>
    );
  }
  return (
    <Link data-cursor="click" href={href} className={cls} {...props}>
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  );
}
