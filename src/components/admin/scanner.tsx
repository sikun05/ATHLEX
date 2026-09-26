"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, CameraOff, CheckCircle2, Keyboard, LogOut, ShieldAlert, XCircle } from "lucide-react";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ScanResult = {
  result: "checked_in" | "checked_out" | "duplicate" | "denied";
  reason?: string;
  member: { name: string; code: string };
  plan?: string;
  daysRemaining?: number;
  minutes?: number;
};

/** Front-desk scanner: camera QR scanning (html5-qrcode) with manual member-code fallback. */
export function Scanner() {
  const router = useRouter();
  const [camera, setCamera] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<ScanResult | null>(null);
  const [scanId, setScanId] = useState(0);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const lock = useRef(false);

  const submit = useCallback(
    async (body: { token?: string; memberCode?: string }) => {
      if (lock.current) return;
      lock.current = true;
      setBusy(true);
      try {
        const r = await api<ScanResult>("/api/attendance/scan", { body });
        setLast(r);
        setScanId((n) => n + 1);
        if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(r.result === "denied" ? [80, 60, 80] : 60);
        router.refresh();
      } catch (e) {
        setLast(null);
        toast.error((e as Error).message);
      } finally {
        setBusy(false);
        // brief cool-down so one QR isn't read ten times
        setTimeout(() => (lock.current = false), 2000);
      }
    },
    [router],
  );

  useEffect(() => {
    if (!camera) return;
    let cancelled = false;
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;
      const s = new Html5Qrcode("qr-reader", { verbose: false });
      scannerRef.current = s as unknown as { stop: () => Promise<void>; clear: () => void };
      try {
        await s.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 240, height: 240 } }, (text) => submit({ token: text }), () => {});
      } catch {
        toast.error("Camera unavailable — allow camera access or use the member code.");
        setCamera(false);
      }
    })();
    return () => {
      cancelled = true;
      scannerRef.current
        ?.stop()
        .then(() => scannerRef.current?.clear())
        .catch(() => {});
      scannerRef.current = null;
    };
  }, [camera, submit]);

  const tone = last ? { checked_in: "ok", checked_out: "volt", duplicate: "warn", denied: "danger" }[last.result] : null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[var(--radius-card)] border border-white/[0.07] bg-coal p-5">
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-md bg-ink">
          <div id="qr-reader" className="size-full [&_video]:size-full [&_video]:object-cover" />
          {!camera && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div>
                <Camera className="mx-auto size-10 text-ash" />
                <p className="mt-3 text-sm text-smoke">Start the camera and point it at the member&apos;s QR code.</p>
              </div>
            </div>
          )}
          {camera && <div className="pointer-events-none absolute inset-[18%] rounded-lg border-2 border-volt/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" aria-hidden />}
        </div>
        <Button className="mt-4 w-full" variant={camera ? "outline" : "primary"} onClick={() => setCamera((c) => !c)}>
          {camera ? <CameraOff className="size-4" /> : <Camera className="size-4" />} {camera ? "Stop camera" : "Start camera"}
        </Button>

        <form
          className="mt-5 border-t border-white/[0.06] pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) submit(code.trim().startsWith("ATX1.") ? { token: code.trim() } : { memberCode: code.trim().toUpperCase() });
          }}
        >
          <label htmlFor="member-code" className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-smoke">
            <Keyboard className="size-3.5" /> Manual check-in
          </label>
          <div className="mt-2 flex gap-2">
            <input id="member-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ATX-1001" className="field h-11 py-0 font-mono uppercase" autoComplete="off" />
            <Button type="submit" className="h-11 shrink-0" loading={busy}>
              Verify
            </Button>
          </div>
        </form>
      </div>

      <div aria-live="assertive" className="min-h-[20rem] rounded-[var(--radius-card)] border border-white/[0.07] bg-coal p-5">
        <AnimatePresence mode="wait">
          {last ? (
            <motion.div
              key={scanId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex h-full flex-col items-center justify-center rounded-md p-8 text-center",
                tone === "ok" && "bg-ok/10",
                tone === "volt" && "bg-volt/10",
                tone === "warn" && "bg-warn/10",
                tone === "danger" && "bg-danger/10",
              )}
            >
              {last.result === "checked_in" && <CheckCircle2 className="size-16 text-ok" />}
              {last.result === "checked_out" && <LogOut className="size-16 text-volt" />}
              {last.result === "duplicate" && <ShieldAlert className="size-16 text-warn" />}
              {last.result === "denied" && <XCircle className="size-16 text-danger" />}
              <p className="display mt-5 text-4xl">
                {{ checked_in: "Welcome in", checked_out: "See you soon", duplicate: "Already in", denied: "Access denied" }[last.result]}
              </p>
              <p className="mt-2 text-xl font-semibold">{last.member.name}</p>
              <p className="font-mono text-sm text-smoke">{last.member.code}</p>
              {last.reason && <p className="mt-4 text-sm">{last.reason}</p>}
              {last.plan && (
                <p className="mt-4 text-sm text-smoke">
                  {last.plan} · {last.daysRemaining} days left{last.minutes ? ` · session ${last.minutes} min` : ""}
                </p>
              )}
            </motion.div>
          ) : (
            <div className="flex h-full min-h-[18rem] flex-col items-center justify-center text-center text-smoke">
              <p className="display text-3xl text-bone">Ready to scan</p>
              <p className="mt-2 max-w-xs text-sm">Membership is verified on every scan. Scanning a checked-in member again checks them out.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
