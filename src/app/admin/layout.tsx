import type { Metadata } from "next";
import { AppShell, type NavItem } from "@/components/dashboard/app-shell";
import { requireUser, DESK_ROLES } from "@/lib/auth/session";
import { resources } from "@/lib/admin/resources";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin | ATHLEX" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireUser(DESK_ROLES, "/admin");
  const isStaff = user.role === "admin" || user.role === "staff";
  const nav: NavItem[] = [
    { href: "/admin", label: "Overview", icon: "Gauge" },
    { href: "/admin/attendance", label: "Attendance", icon: "ScanLine" },
    ...resources.filter((r) => r.read.includes(user.role)).map((r) => ({ href: `/admin/${r.slug}`, label: r.title, icon: r.icon, group: r.group })),
    ...(isStaff
      ? ([
          { href: "/admin/reports", label: "Reports", icon: "BarChart3", group: "Insights" },
          { href: "/admin/notifications", label: "Notifications", icon: "Bell", group: "Insights" },
        ] as NavItem[])
      : []),
    ...(user.role === "admin" ? ([{ href: "/admin/settings", label: "Settings", icon: "Settings", group: "Insights" }] as NavItem[]) : []),
  ];
  return (
    <AppShell nav={nav} user={{ name: user.name, email: user.email, role: user.role }} area="Admin" mobileTabs={["/admin", "/admin/attendance", "/admin/members", "/admin/trial-bookings"]}>
      {children}
    </AppShell>
  );
}
