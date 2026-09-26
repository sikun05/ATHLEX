"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";

export function CancelBooking({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        if (!confirm("Cancel this booking? Your spot will be released.")) return;
        setBusy(true);
        try {
          await api(`/api/class-bookings/${id}`, { method: "DELETE" });
          toast.success("Booking cancelled");
          router.refresh();
        } catch (e) {
          toast.error((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
      className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-smoke transition hover:border-danger hover:text-danger disabled:opacity-50"
    >
      {busy ? "Cancelling…" : "Cancel"}
    </button>
  );
}
