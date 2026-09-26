import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Refund & Cancellation Policy", alternates: { canonical: "/refund-policy" } };

export default function RefundPage() {
  return (
    <LegalPage title="Refunds & Cancellations" updated="26 September 2026">
      <p>Placeholder policy — update to match your business terms before accepting payments.</p>
      <h2>Cooling-off period</h2>
      <p>Cancel within 7 days of purchase and before your first check-in for a full refund to the original payment method.</p>
      <h2>Duplicate or failed payments</h2>
      <p>If you were charged twice or a payment failed after money was debited, it is refunded automatically within 5–7 business days. Contact {site.email} with your receipt number if you need help.</p>
      <h2>Freezing</h2>
      <p>Premium and Elite members may freeze their membership for up to 30 days per year.</p>
    </LegalPage>
  );
}
