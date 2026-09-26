import { Dumbbell, Timer } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getWorkoutPlan } from "@/lib/dashboard";
import { Card, PageHeader } from "@/components/dashboard/ui";
import { NoMemberProfile } from "@/components/dashboard/no-member";
import { EmptyState } from "@/components/ui/misc";
import { WorkoutDays } from "@/components/dashboard/workout-days";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Workout Plan" };

export default async function WorkoutPage() {
  const user = await requireUser();
  if (!user.memberId) return <NoMemberProfile />;
  const data = await getWorkoutPlan(user.memberId);
  if (!data)
    return (
      <>
        <PageHeader title="Workout plan" />
        <EmptyState icon={<Dumbbell className="size-5" />} title="No workout plan assigned yet">
          Your coach will publish your plan after your assessment. Premium & Elite members get a fully custom program.
        </EmptyState>
      </>
    );
  const { plan, exercises, trainer } = data;
  const days = [...new Set(exercises.map((e) => e.day_label as string))];

  return (
    <>
      <PageHeader eyebrow={plan.goal ?? "Training"} title={plan.title}>
        Assigned by {trainer?.name ?? "your coach"} · {formatDate(plan.start_date)}
        {plan.end_date ? ` → ${formatDate(plan.end_date)}` : ""}
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-4">
        <Card title="Coach" className="lg:col-span-1">
          <p className="display text-3xl">{trainer?.name ?? "—"}</p>
          <p className="text-sm text-smoke">{trainer?.specialization}</p>
          {plan.notes && <p className="mt-5 rounded-md bg-graphite p-4 text-sm text-bone/80">{plan.notes}</p>}
          <p className="mt-5 flex items-center gap-2 text-xs text-smoke">
            <Timer className="size-3.5" /> {days.length} sessions / week · {exercises.length} exercises
          </p>
        </Card>
        <div className="lg:col-span-3">
          <WorkoutDays
            days={days}
            exercises={exercises.map((e) => ({ id: e.id, day: e.day_label, exercise: e.exercise, sets: e.sets, reps: e.reps, rest: e.rest_seconds, notes: e.notes }))}
          />
        </div>
      </div>
    </>
  );
}
