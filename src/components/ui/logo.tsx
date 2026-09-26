import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("size-8", className)}>
      <rect width="40" height="40" rx="6" fill="#c8ff2e" />
      <path d="M9 30 19.2 9h1.6L31 30h-5.2l-2.1-4.6h-7.4L14.2 30H9Zm8.2-8.6h4.9L19.7 16l-2.5 5.4Z" fill="#060606" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="display text-2xl leading-none tracking-wide">ATHLEX</span>
    </span>
  );
}
