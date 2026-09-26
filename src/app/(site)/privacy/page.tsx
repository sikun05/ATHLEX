import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="26 September 2026">
      <p>
        {site.legalName} (&quot;{site.name}&quot;) respects your privacy. This policy explains what we collect, why, and the choices you have. Replace this placeholder with counsel-reviewed text
        before launch.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details: name, email, phone number.</li>
        <li>Membership & payment records (card data is handled by Razorpay and never stored by us).</li>
        <li>Training data you choose to record: attendance, measurements, progress photos.</li>
      </ul>
      <h2>How we use it</h2>
      <p>To run your membership, schedule classes, verify check-ins, send service notifications and improve our coaching. We never sell personal data.</p>
      <h2>Security</h2>
      <p>Data is stored in access-controlled databases with row-level security; progress photos live in private storage visible only to you and your coach.</p>
      <h2>Your rights</h2>
      <p>You may request a copy, correction or deletion of your data at any time by emailing {site.email}.</p>
    </LegalPage>
  );
}
