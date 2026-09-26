"use client";

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { api } from "@/lib/client-api";
import { Skeleton } from "@/components/ui/misc";

/** Rotating, signed QR code. Refreshes before expiry and when the tab regains focus. */
export function MemberQr({ memberCode }: { memberCode: string }) {
  const [data, setData] = useState<{ token: string; exp: number; active: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [nonce, setNonce] = useState(0);
  const load = useCallback(() => setNonce((n) => n + 1), []);

  // Fetch a fresh signed token whenever `nonce` changes
  useEffect(() => {
    let alive = true;
    api<{ token: string; exp: number; active: boolean }>("/api/attendance/token")
      .then((next) => {
        if (!alive) return;
        setError(null);
        setData(next);
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [nonce]);

  useEffect(() => {
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(id);
    };
  }, [load]);

  const left = data ? Math.max(0, Math.ceil((data.exp - now) / 1000)) : 0;
  // Rotate shortly before expiry (keyed on the token so it fires once per code)
  const expiring = Boolean(data && left <= 5);
  const [rotatedFor, setRotatedFor] = useState<string | null>(null);
  if (expiring && data && rotatedFor !== data.token) {
    setRotatedFor(data.token);
    setNonce((n) => n + 1);
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative rounded-2xl bg-bone p-5 shadow-[0_0_80px_-20px_rgba(200,255,46,0.5)]">
        {data ? <QRCodeSVG value={data.token} size={232} level="M" bgColor="#f3f3ef" fgColor="#060606" aria-label="Your check-in QR code" role="img" /> : <Skeleton className="size-[232px] rounded-lg" />}
        {data && !data.active && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-ink/85 p-6 text-sm text-warn">No active membership — the desk will be unable to check you in.</div>
        )}
      </div>
      <p className="mt-5 font-mono text-sm tracking-[0.2em]">{memberCode}</p>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : (
        <p className="mt-3 flex items-center gap-2 text-xs text-smoke" aria-live="polite">
          <ShieldCheck className="size-3.5 text-volt" /> Refreshes in {left}s
        </p>
      )}
      <div className="mt-3 h-1 w-48 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-volt transition-[width] duration-1000 ease-linear" style={{ width: `${(left / 60) * 100}%` }} />
      </div>
      <button onClick={load} className="mt-4 inline-flex items-center gap-2 text-xs text-smoke hover:text-volt">
        <RefreshCw className="size-3.5" /> Refresh now
      </button>
    </div>
  );
}
