import Link from "next/link";
import { UserRound } from "lucide-react";
import { EmptyState } from "@/components/ui/misc";

export function NoMemberProfile() {
  return (
    <EmptyState icon={<UserRound className="size-5" />} title="No member profile on this account" action={<Link href="/admin" className="text-sm text-volt hover:underline">Go to admin console →</Link>}>
      Staff and admin accounts don&apos;t have memberships. Sign in with a member account to see this page.
    </EmptyState>
  );
}
