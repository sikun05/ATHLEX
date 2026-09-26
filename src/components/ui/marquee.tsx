import { cn } from "@/lib/utils";

export function Marquee({
  items,
  reverse,
  duration = 40,
  className,
  itemClassName,
  separator = "•",
}: {
  items: string[];
  reverse?: boolean;
  duration?: number;
  className?: string;
  itemClassName?: string;
  separator?: string;
}) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className={cn("flex items-center whitespace-nowrap", itemClassName)}>
          <span>{item}</span>
          <span className="mx-6 text-volt sm:mx-10" aria-hidden>
            {separator}
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cn("group flex overflow-hidden", className)}>
      <div
        className={cn("flex w-max group-hover:[animation-play-state:paused]", reverse ? "animate-marquee-reverse" : "animate-marquee")}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
