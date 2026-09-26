import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutFlow } from "@/components/forms/checkout-flow";
import { getCurrentUser } from "@/lib/auth/session";
import { getPlans } from "@/lib/data";
import { getRepo } from "@/lib/db";
import { getActiveMembership } from "@/lib/members";
import { gatewayMode } from "@/lib/payments/service";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ params, searchParams }: PageProps<"/checkout/[plan]">) {
  const { plan: slug } = await params;
  const { step } = await searchParams;
  const plans = await getPlans();
  const plan = plans.find((p) => p.slug === slug);
  if (!plan) notFound();

  const user = await getCurrentUser();
  let profile = null;
  let active = null;
  if (user?.memberId) {
    const repo = await getRepo("user");
    const m = await repo.get("members", user.memberId);
    profile = {
      fullName: user.name,
      phone: user.phone ?? "",
      dateOfBirth: m?.date_of_birth ?? "",
      gender: m?.gender ?? undefined,
      fitnessGoal: m?.fitness_goal ?? "",
      emergencyContactName: m?.emergency_contact_name ?? "",
      emergencyContactPhone: m?.emergency_contact_phone ?? "",
    };
    const a = await getActiveMembership(user.memberId);
    if (a) active = { planName: a.plan?.name ?? "", end: a.effectiveEnd as string };
  }

  return (
    <div className="container-x pb-24 pt-32 sm:pt-36">
      <CheckoutFlow
        plan={plan}
        plans={plans.map((p) => ({ slug: p.slug, name: p.name, price: p.price, durationMonths: p.durationMonths }))}
        user={user ? { name: user.name, email: user.email, role: user.role } : null}
        profile={profile}
        active={active}
        gateway={gatewayMode()}
        initialStep={user && step === "1" ? 1 : 0}
      />
    </div>
  );
}
