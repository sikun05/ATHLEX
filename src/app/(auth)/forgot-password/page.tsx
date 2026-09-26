import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Forgot Password", robots: { index: false } };

export default function ForgotPage() {
  return (
    <>
      <h1 className="display text-5xl sm:text-6xl">Reset password</h1>
      <p className="mb-10 mt-3 text-smoke">Enter your email and we&apos;ll send you a secure link.</p>
      <ForgotForm />
      <Link href="/login" className="mt-8 block text-center text-sm text-smoke hover:text-volt">
        ← Back to sign in
      </Link>
    </>
  );
}
