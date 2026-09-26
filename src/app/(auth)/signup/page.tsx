import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Create Account", robots: { index: false } };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  return (
    <>
      <h1 className="display text-6xl">Join ATHLEX</h1>
      <p className="mb-10 mt-3 text-smoke">Create your account to buy a membership, book classes and track progress.</p>
      <SignupForm next={typeof next === "string" ? next : undefined} />
      <p className="mt-8 text-center text-sm text-smoke">
        Already a member?{" "}
        <Link href={`/login${typeof next === "string" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-volt hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
