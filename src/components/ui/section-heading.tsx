import { cn } from "@/lib/utils";
import { SplitWords, Reveal } from "@/components/motion/reveal";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  index,
  children,
  align = "left",
  className,
  as = "h2",
}: {
  eyebrow: string;
  title: string;
  index?: string;
  children?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("flex flex-col gap-5", align === "center" && "items-center text-center", className)}>
      <Reveal className="flex items-center gap-3">
        {index && <span className="font-mono text-xs text-smoke">{index}</span>}
        <span className="h-px w-8 bg-volt" aria-hidden />
        <span className="eyebrow">{eyebrow}</span>
      </Reveal>
      <SplitWords as={as} text={title} className="display max-w-[14ch] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl" />
      {children && (
        <Reveal delay={0.15} className={cn("max-w-xl text-base leading-relaxed text-smoke sm:text-lg", align === "center" && "mx-auto")}>
          {children}
        </Reveal>
      )}
    </div>
  );
}
