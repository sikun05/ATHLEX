import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ResendVerification } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false } };

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const { email } = await searchParams;
  return (
    <div className="text-center">
      <MailCheck className="mx-auto size-14 text-volt" />
      <h1 className="display mt-6 text-5xl">Verify your email</h1>
      <p className="mt-4 text-smoke">
        We sent a confirmation link to <strong className="text-bone">{typeof email === "string" ? email : "your inbox"}</strong>. Click it to activate your account, then come back to
        continue.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <ResendVerification email={typeof email === "string" ? email : undefined} />
        <Link href="/login" className="inline-flex h-12 items-center rounded-full bg-volt px-6 text-xs font-semibold uppercase tracking-[0.08em] text-ink">
          Go to sign in
        </Link>
      </div>
    </div>
  );
}
