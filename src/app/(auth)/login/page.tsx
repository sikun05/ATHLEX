import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Member Login", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error, reset } = await searchParams;
  return (
    <>
      <h1 className="display text-6xl">Welcome back</h1>
      <p className="mb-10 mt-3 text-smoke">Sign in to your ATHLEX account.</p>
      {error === "link" && <p role="alert" className="mb-6 rounded border border-danger/30 bg-danger/10 p-3 text-sm text-danger">That link is invalid or has expired. Please try again.</p>}
      {reset && <p role="status" className="mb-6 rounded border border-ok/30 bg-ok/10 p-3 text-sm text-ok">Password updated — sign in with your new password.</p>}
      <LoginForm next={typeof next === "string" ? next : undefined} />
      <p className="mt-8 text-center text-sm text-smoke">
        New to ATHLEX?{" "}
        <Link href={`/signup${typeof next === "string" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-volt hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
