"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * next/image with a branded fallback: if a remote photo fails to load the slot
 * renders a charcoal gradient with the ATHLEX mark instead of a broken image.
 */
export function Photo({ className, alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-[radial-gradient(120%_80%_at_20%_10%,#2a2a2e_0%,#0c0c0d_60%)]",
          props.fill ? "absolute inset-0" : "",
          className,
        )}
      >
        <span className="display select-none text-4xl text-white/[0.06]">ATHLEX</span>
      </div>
    );
  }
  return <Image alt={alt} className={className} onError={() => setFailed(true)} {...props} />;
}
