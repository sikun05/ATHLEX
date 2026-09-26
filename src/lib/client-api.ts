export class ClientApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public fieldErrors?: Record<string, string[] | undefined>,
  ) {
    super(message);
  }
}

/** JSON fetch wrapper for our API routes. Throws ClientApiError with server-provided messages. */
export async function api<T = unknown>(url: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: init.method ?? (init.body ? "POST" : "GET"),
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ClientApiError("Network error — check your connection and try again.", 0);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) {
    throw new ClientApiError(json.error ?? `Request failed (${res.status})`, res.status, json.code, json.details);
  }
  return json.data as T;
}

/** Push server-side field errors into react-hook-form. */
export function applyFieldErrors(err: unknown, setError: (name: never, e: { message: string }) => void) {
  if (err instanceof ClientApiError && err.fieldErrors) {
    for (const [k, v] of Object.entries(err.fieldErrors)) if (v?.[0]) setError(k as never, { message: v[0] });
  }
}
