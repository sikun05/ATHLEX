import type { Metadata } from "next";
import { ResetForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Choose a New Password", robots: { index: false } };

export default async function ResetPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  return (
    <>
      <h1 className="display text-6xl">New password</h1>
      <p className="mb-10 mt-3 text-smoke">Choose a strong password you haven&apos;t used before.</p>
      <ResetForm token={typeof token === "string" ? token : undefined} />
    </>
  );
}
