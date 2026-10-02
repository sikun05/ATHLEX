"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarCheck2 } from "lucide-react";
import { trialBookingSchema, trialInterests, trialTimes, type TrialBookingInput } from "@/lib/validation";
import { api, applyFieldErrors } from "@/lib/client-api";
import { Field, fieldA11y } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SuccessCheck } from "@/components/ui/success-check";
import { whatsappLink } from "@/lib/site";
import { addDays, formatDate, toISODate } from "@/lib/utils";

const label = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export function TrialBookingForm({ defaultInterest, onDone }: { defaultInterest?: string; onDone?: () => void }) {
  const [booked, setBooked] = useState<null | { name: string; date: string; time: string }>(null);
  const today = new Date();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TrialBookingInput>({
    resolver: zodResolver(trialBookingSchema),
    defaultValues: {
      preferredDate: toISODate(addDays(today, 1)),
      interest: (trialInterests as readonly string[]).includes(defaultInterest ?? "") ? (defaultInterest as TrialBookingInput["interest"]) : undefined,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api("/api/trial-bookings", { body: values });
      setBooked({ name: values.name.split(" ")[0], date: values.preferredDate, time: values.preferredTime });
      reset();
    } catch (e) {
      applyFieldErrors(e, setError as never);
      toast.error((e as Error).message);
    }
  });

  return (
    <AnimatePresence mode="wait" initial={false}>
      {booked ? (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 text-center" role="status">
          <SuccessCheck />
          <h3 className="display mt-6 text-h3">You&apos;re booked, {booked.name}!</h3>
          <p className="mt-3 max-w-sm text-sm text-smoke">
            Your free trial is set for <strong className="text-bone">{formatDate(booked.date, { weekday: "long", day: "numeric", month: "long" })}</strong> at{" "}
            <strong className="text-bone">{label(booked.time)}</strong>. We&apos;ve sent a confirmation to your email & WhatsApp — our team will call to confirm.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={whatsappLink(`Hi! I just booked a free trial for ${booked.date} at ${label(booked.time)}.`)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] hover:border-volt hover:text-volt">
              Message us
            </a>
            <Button onClick={() => (onDone ? onDone() : setBooked(null))}>{onDone ? "Done" : "Book another"}</Button>
          </div>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} className="relative grid gap-5 sm:grid-cols-2">
          <Field id="trial-name" label="Full name" error={errors.name?.message} required>
            <input className="field" autoComplete="name" placeholder="Your name" {...fieldA11y("trial-name", errors.name?.message)} {...register("name")} />
          </Field>
          <Field id="trial-phone" label="Phone" error={errors.phone?.message} required>
            <input className="field" type="tel" autoComplete="tel" inputMode="tel" placeholder="+91 98765 43210" {...fieldA11y("trial-phone", errors.phone?.message)} {...register("phone")} />
          </Field>
          <Field id="trial-email" label="Email" error={errors.email?.message} required className="sm:col-span-2">
            <input className="field" type="email" autoComplete="email" placeholder="you@email.com" {...fieldA11y("trial-email", errors.email?.message)} {...register("email")} />
          </Field>
          <Field id="trial-date" label="Preferred date" error={errors.preferredDate?.message} required>
            <input className="field" type="date" min={toISODate(today)} max={toISODate(addDays(today, 60))} {...fieldA11y("trial-date", errors.preferredDate?.message)} {...register("preferredDate")} />
          </Field>
          <Field id="trial-time" label="Preferred time" error={errors.preferredTime?.message} required>
            <select className="field" defaultValue="" {...fieldA11y("trial-time", errors.preferredTime?.message)} {...register("preferredTime")}>
              <option value="" disabled>
                Select a time
              </option>
              {trialTimes.map((t) => (
                <option key={t} value={t}>
                  {label(t)}
                </option>
              ))}
            </select>
          </Field>
          <Field id="trial-interest" label="Training interest" error={errors.interest?.message} required className="sm:col-span-2">
            <select className="field" defaultValue={defaultInterest ?? ""} {...fieldA11y("trial-interest", errors.interest?.message)} {...register("interest")}>
              <option value="" disabled>
                What would you like to try?
              </option>
              {trialInterests.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field id="trial-message" label="Anything we should know? (optional)" error={errors.message?.message} className="sm:col-span-2">
            <textarea className="field min-h-24 resize-y" placeholder="Injuries, goals, questions…" {...fieldA11y("trial-message", errors.message?.message)} {...register("message")} />
          </Field>
          <div aria-hidden className="absolute -left-[9999px]">
            <label htmlFor="trial-company">Company</label>
            <input id="trial-company" tabIndex={-1} autoComplete="off" {...register("company")} />
          </div>
          <div className="flex flex-col-reverse items-start justify-between gap-4 sm:col-span-2 sm:flex-row sm:items-center">
            <p className="text-xs text-ash">No payment needed. We&apos;ll never share your details.</p>
            <Button type="submit" size="lg" loading={isSubmitting} className="w-full sm:w-auto">
              <CalendarCheck2 className="size-4" /> Book free trial
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
