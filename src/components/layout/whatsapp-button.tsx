"use client";

import { motion } from "motion/react";
import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/social-icons";
import { usePreloaded } from "./preloader";

export function WhatsAppButton() {
  const ready = usePreloaded();
  return (
    <motion.a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      data-cursor="click"
      initial={{ scale: 0, opacity: 0 }}
      animate={ready ? { scale: 1, opacity: 1 } : undefined}
      transition={{ delay: 1.4, type: "spring", stiffness: 260, damping: 18 }}
      className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-3 sm:bottom-6 sm:right-6"
    >
      <span className="pointer-events-none hidden translate-x-2 rounded-full bg-bone px-4 py-2 text-xs font-semibold text-ink opacity-0 shadow-xl transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:block">
        Chat with us
      </span>
      <span className="relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_40px_-8px_rgba(37,211,102,0.6)] transition-transform duration-300 group-hover:scale-105">
        <span className="absolute inset-0 rounded-full bg-[#25D366] [animation:pulse-ring_2.4s_var(--ease-expo)_infinite] [--ring-scale:1.45]" aria-hidden />
        <WhatsAppIcon className="relative size-7" />
      </span>
    </motion.a>
  );
}
