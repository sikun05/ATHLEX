import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Membership", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Membership" updated="26 September 2026">
      <p>These placeholder terms govern use of {site.name} facilities and services. Replace with your final, legally reviewed terms.</p>
      <h2>Membership</h2>
      <ul>
        <li>Memberships are personal and non-transferable.</li>
        <li>Membership activates once payment is verified and runs for the plan duration.</li>
        <li>Renewals purchased before expiry begin the day after your current plan ends.</li>
      </ul>
      <h2>Health & safety</h2>
      <p>You confirm you are fit to exercise and will disclose relevant medical conditions to your coach. Follow staff instructions and use equipment responsibly.</p>
      <h2>Conduct</h2>
      <p>We reserve the right to suspend memberships for behaviour that endangers or disrespects other members or staff.</p>
    </LegalPage>
  );
}
