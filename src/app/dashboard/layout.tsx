import type { Metadata } from "next";
import { AppShell, type NavItem } from "@/components/dashboard/app-shell";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · Dashboard | ATHLEX" }, robots: { index: false, follow: false } };

const nav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
  { href: "/dashboard/membership", label: "Membership", icon: "WalletCards" },
  { href: "/dashboard/attendance", label: "Check-in", icon: "QrCode" },
  { href: "/dashboard/classes", label: "Classes", icon: "CalendarDays" },
  { href: "/dashboard/workout", label: "Workout", icon: "Dumbbell", group: "Training" },
  { href: "/dashboard/diet", label: "Diet", icon: "Utensils", group: "Training" },
  { href: "/dashboard/progress", label: "Progress", icon: "Activity", group: "Training" },
  { href: "/dashboard/profile", label: "Profile", icon: "UserRound", group: "Account" },
];

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUser(undefined, "/dashboard");
  const shellNav = user.role === "member" ? nav : [...nav, { href: "/admin", label: "Admin console", icon: "Gauge", group: "Account" } as NavItem];
  return (
    <AppShell nav={shellNav} user={{ name: user.name, email: user.email, role: user.role }} area="Member" mobileTabs={["/dashboard", "/dashboard/attendance", "/dashboard/classes", "/dashboard/progress", "/dashboard/profile"]}>
      {children}
    </AppShell>
  );
}
