"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { api, applyFieldErrors } from "@/lib/client-api";
import { Field, fieldA11y } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SuccessCheck } from "@/components/ui/success-check";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, setError, reset, formState } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });
  const e = formState.errors;
  const onSubmit = handleSubmit(async (v) => {
    try {
      await api("/api/contact", { body: v });
      setSent(true);
      reset();
    } catch (err) {
      applyFieldErrors(err, setError as never);
      toast.error((err as Error).message);
    }
  });
  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-10 text-center" role="status">
          <SuccessCheck size={80} />
          <p className="display mt-6 text-3xl">Message sent</p>
          <p className="mt-2 text-sm text-smoke">We reply within one business day — usually much sooner.</p>
          <button onClick={() => setSent(false)} className="mt-6 text-sm text-volt hover:underline">
            Send another message
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2" exit={{ opacity: 0 }}>
          <Field id="c-name" label="Name" error={e.name?.message} required>
            <input className="field" autoComplete="name" {...fieldA11y("c-name", e.name?.message)} {...register("name")} />
          </Field>
          <Field id="c-email" label="Email" error={e.email?.message} required>
            <input className="field" type="email" autoComplete="email" {...fieldA11y("c-email", e.email?.message)} {...register("email")} />
          </Field>
          <Field id="c-phone" label="Phone (optional)" error={e.phone?.message}>
            <input className="field" type="tel" autoComplete="tel" {...fieldA11y("c-phone", e.phone?.message)} {...register("phone")} />
          </Field>
          <Field id="c-subject" label="Subject" error={e.subject?.message} required>
            <input className="field" placeholder="Membership, PT, corporate…" {...fieldA11y("c-subject", e.subject?.message)} {...register("subject")} />
          </Field>
          <Field id="c-message" label="Message" error={e.message?.message} required className="sm:col-span-2">
            <textarea className="field min-h-32 resize-y" {...fieldA11y("c-message", e.message?.message)} {...register("message")} />
          </Field>
          <div aria-hidden className="absolute -left-[9999px]">
            <input tabIndex={-1} autoComplete="off" {...register("company")} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" loading={formState.isSubmitting} className="w-full sm:w-auto">
              <Send className="size-4" /> Send message
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
