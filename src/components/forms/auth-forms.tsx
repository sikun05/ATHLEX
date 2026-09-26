"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { forgotSchema, loginSchema, resetSchema, signupSchema, type LoginInput, type SignupInput } from "@/lib/validation";
import { api, applyFieldErrors, ClientApiError } from "@/lib/client-api";
import { Field, fieldA11y } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { resetSessionCache } from "@/components/layout/use-session";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { FacebookIcon, GoogleIcon } from "@/components/ui/social-icons";
import { cn } from "@/lib/utils";
import type { z } from "zod";

function PasswordInput({ id, error, reg, autoComplete }: { id: string; error?: string; reg: object; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input className="field pr-12" type={show ? "text" : "password"} autoComplete={autoComplete} {...fieldA11y(id, error)} {...reg} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-smoke hover:text-bone">
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

const PROVIDERS = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "facebook", label: "Facebook", Icon: FacebookIcon },
] as const;

/** OAuth sign-in via Supabase; lands on /auth/callback which exchanges the code. Providers must be enabled in the Supabase dashboard. */
export function SocialLogin({ next }: { next?: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const signIn = async (provider: (typeof PROVIDERS)[number]["id"]) => {
    const supabase = getBrowserSupabase();
    if (!supabase) return toast.error("Social login needs Supabase configured — use email in demo mode.");
    setBusy(provider);
    const redirectTo = `${location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) {
      setBusy(null);
      toast.error(error.message);
    }
  };
  return (
    <div className="mb-8">
      <div className="grid gap-3">
        {PROVIDERS.map(({ id, label, Icon }) => (
          <Button key={id} type="button" variant="outline" loading={busy === id} disabled={busy !== null} onClick={() => signIn(id)} className="w-full normal-case tracking-normal text-sm">
            <Icon className={cn("size-5", id === "facebook" && "text-[#1877F2]")} />
            Continue with {label}
          </Button>
        ))}
      </div>
      <p className="mt-8 flex items-center gap-4 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ash before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">or with email</p>
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { register, handleSubmit, formState, setError } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { next } });
  const e = formState.errors;
  const onSubmit = handleSubmit(async (v) => {
    try {
      const { redirectTo } = await api<{ redirectTo: string }>("/api/auth/login", { body: v });
      resetSessionCache();
      toast.success("Welcome back!");
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      applyFieldErrors(err, setError as never);
      if (err instanceof ClientApiError && err.code === "EMAIL_NOT_VERIFIED") router.push(`/verify-email?email=${encodeURIComponent(v.email)}`);
      toast.error((err as Error).message);
    }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field id="login-email" label="Email" error={e.email?.message}>
        <input className="field" type="email" autoComplete="email" autoFocus {...fieldA11y("login-email", e.email?.message)} {...register("email")} />
      </Field>
      <Field id="login-password" label="Password" error={e.password?.message}>
        <PasswordInput id="login-password" error={e.password?.message} autoComplete="current-password" reg={register("password")} />
      </Field>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="-my-2 inline-block py-2 text-sm text-smoke hover:text-volt">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" size="lg" loading={formState.isSubmitting} className="w-full">
        Sign in
      </Button>
    </form>
  );
}

export function SignupForm({ next }: { next?: string }) {
  const router = useRouter();
  const { register, handleSubmit, formState, setError } = useForm<SignupInput>({ resolver: zodResolver(signupSchema), defaultValues: { next } });
  const e = formState.errors;
  const onSubmit = handleSubmit(async (v) => {
    try {
      const res = await api<{ redirectTo: string; needsVerification: boolean }>("/api/auth/signup", { body: v });
      resetSessionCache();
      toast.success(res.needsVerification ? "Check your inbox to verify your email." : "Account created — welcome to ATHLEX!");
      router.replace(res.redirectTo);
      router.refresh();
    } catch (err) {
      applyFieldErrors(err, setError as never);
      toast.error((err as Error).message);
    }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field id="su-name" label="Full name" error={e.fullName?.message} className="sm:col-span-2">
        <input className="field" autoComplete="name" autoFocus {...fieldA11y("su-name", e.fullName?.message)} {...register("fullName")} />
      </Field>
      <Field id="su-email" label="Email" error={e.email?.message}>
        <input className="field" type="email" autoComplete="email" {...fieldA11y("su-email", e.email?.message)} {...register("email")} />
      </Field>
      <Field id="su-phone" label="Phone" error={e.phone?.message}>
        <input className="field" type="tel" autoComplete="tel" placeholder="+91" {...fieldA11y("su-phone", e.phone?.message)} {...register("phone")} />
      </Field>
      <Field id="su-password" label="Password" error={e.password?.message} hint="8+ characters with a letter and a number">
        <PasswordInput id="su-password" error={e.password?.message} autoComplete="new-password" reg={register("password")} />
      </Field>
      <Field id="su-confirm" label="Confirm password" error={e.confirmPassword?.message}>
        <PasswordInput id="su-confirm" error={e.confirmPassword?.message} autoComplete="new-password" reg={register("confirmPassword")} />
      </Field>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-smoke">
          <input type="checkbox" className="mt-1 size-4 accent-[#c8ff2e]" aria-invalid={Boolean(e.acceptTerms) || undefined} {...register("acceptTerms")} />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="text-bone underline" target="_blank">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-bone underline" target="_blank">
              privacy policy
            </Link>
            .
          </span>
        </label>
        {e.acceptTerms && (
          <p role="alert" className="mt-2 text-xs text-danger">
            {e.acceptTerms.message}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" loading={formState.isSubmitting} className="w-full sm:col-span-2">
        Create account
      </Button>
    </form>
  );
}

export function ForgotForm() {
  const [sent, setSent] = useState<null | { demoLink?: string }>(null);
  const { register, handleSubmit, formState } = useForm<z.input<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });
  const onSubmit = handleSubmit(async (v) => {
    try {
      setSent(await api<{ demoLink?: string }>("/api/auth/forgot", { body: v }));
    } catch (err) {
      toast.error((err as Error).message);
    }
  });
  if (sent)
    return (
      <div className="rounded-[var(--radius-card)] border border-white/10 bg-graphite p-6" role="status">
        <MailCheck className="size-8 text-volt" />
        <p className="mt-4 font-semibold">Check your inbox</p>
        <p className="mt-1 text-sm text-smoke">If an account exists for that email, we&apos;ve sent a reset link. It expires in 30 minutes.</p>
        {sent.demoLink && (
          <Link href={sent.demoLink} className="mt-4 inline-block text-sm text-volt underline">
            Demo mode: open reset link →
          </Link>
        )}
      </div>
    );
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field id="fp-email" label="Email" error={formState.errors.email?.message}>
        <input className="field" type="email" autoComplete="email" autoFocus {...fieldA11y("fp-email", formState.errors.email?.message)} {...register("email")} />
      </Field>
      <Button type="submit" size="lg" loading={formState.isSubmitting} className="w-full">
        Send reset link
      </Button>
    </form>
  );
}

export function ResetForm({ token }: { token?: string }) {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<z.input<typeof resetSchema>>({ resolver: zodResolver(resetSchema), defaultValues: { token } });
  const e = formState.errors;
  const onSubmit = handleSubmit(async (v) => {
    try {
      const { redirectTo } = await api<{ redirectTo: string }>("/api/auth/reset", { body: v });
      toast.success("Password updated.");
      router.replace(redirectTo);
    } catch (err) {
      toast.error((err as Error).message);
    }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field id="rp-pass" label="New password" error={e.password?.message} hint="8+ characters with a letter and a number">
        <PasswordInput id="rp-pass" error={e.password?.message} autoComplete="new-password" reg={register("password")} />
      </Field>
      <Field id="rp-confirm" label="Confirm password" error={e.confirmPassword?.message}>
        <PasswordInput id="rp-confirm" error={e.confirmPassword?.message} autoComplete="new-password" reg={register("confirmPassword")} />
      </Field>
      <Button type="submit" size="lg" loading={formState.isSubmitting} className="w-full">
        Update password
      </Button>
    </form>
  );
}

export function ResendVerification({ email }: { email?: string }) {
  const [busy, setBusy] = useState(false);
  if (!email) return null;
  return (
    <Button
      variant="outline"
      loading={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await api("/api/auth/resend", { body: { email } });
          toast.success("Verification email sent again.");
        } catch (err) {
          toast.error((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      Resend email
    </Button>
  );
}
