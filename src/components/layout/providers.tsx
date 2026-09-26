"use client";

import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster
        position="bottom-center"
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "!bg-graphite !border !border-white/10 !text-bone !rounded-[6px] !font-sans",
            description: "!text-smoke",
            success: "[&_[data-icon]]:!text-volt",
            error: "[&_[data-icon]]:!text-danger",
          },
        }}
      />
    </MotionConfig>
  );
}
