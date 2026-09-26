import { requireUser } from "@/lib/auth/session";
import { getRepo } from "@/lib/db";
import { Card, PageHeader } from "@/components/dashboard/ui";
import { PasswordForm, ProfileForm } from "@/components/dashboard/profile-forms";
import { Badge } from "@/components/ui/misc";
import { formatDate, initials } from "@/lib/utils";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const repo = await getRepo("user");
  const m = user.memberId ? await repo.get("members", user.memberId) : null;
  return (
    <>
      <PageHeader eyebrow="Account" title="Profile" />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Personal details">
          <ProfileForm
            email={user.email}
            defaults={{
              fullName: user.name,
              phone: user.phone ?? "",
              dateOfBirth: m?.date_of_birth ?? "",
              gender: m?.gender ?? "",
              heightCm: m?.height_cm ?? "",
              fitnessGoal: m?.fitness_goal ?? "",
              emergencyContactName: m?.emergency_contact_name ?? "",
              emergencyContactPhone: m?.emergency_contact_phone ?? "",
              address: m?.address ?? "",
            }}
          />
        </Card>
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-4">
              <span className="grid size-16 place-items-center rounded-full bg-volt font-mono text-lg font-bold text-ink">{initials(user.name)}</span>
              <div>
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="text-sm text-smoke">{user.email}</p>
                <div className="mt-2 flex gap-2">
                  <Badge tone="volt">{user.role}</Badge>
                  {user.emailVerified && <Badge tone="ok">Verified</Badge>}
                </div>
              </div>
            </div>
            {m && (
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5 text-sm">
                <div>
                  <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-smoke">Member ID</dt>
                  <dd className="mt-1 font-mono">{m.member_code}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-smoke">Joined</dt>
                  <dd className="mt-1">{formatDate(m.joined_at)}</dd>
                </div>
              </dl>
            )}
          </Card>
          <Card title="Security">
            <PasswordForm />
          </Card>
        </div>
      </div>
    </>
  );
}
