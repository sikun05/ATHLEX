"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { newsletterSchema } from "@/lib/validation";
import { api } from "@/lib/client-api";
import { cn } from "@/lib/utils";

export function NewsletterForm() {
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState, reset } = useForm<{ email: string }>({ resolver: zodResolver(newsletterSchema) });
  const onSubmit = handleSubmit(async (v) => {
    try {
      await api("/api/newsletter", { body: v });
      setDone(true);
      reset();
      toast.success("You're subscribed. Welcome to the club.");
    } catch (e) {
      toast.error((e as Error).message);
    }
  });
  const err = formState.errors.email?.message;
  return (
    <form onSubmit={onSubmit} noValidate className="mt-5">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className={cn("flex items-center rounded-full border bg-graphite p-1 pl-5 transition focus-within:border-volt", err ? "border-danger" : "border-white/10")}>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          aria-invalid={Boolean(err) || undefined}
          aria-describedby={err ? "newsletter-error" : undefined}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ash"
          {...register("email")}
        />
        <button
          type="submit"
          disabled={formState.isSubmitting}
          aria-label="Subscribe"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-volt text-ink transition hover:scale-105 disabled:opacity-60"
        >
          {done ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
        </button>
      </div>
      {err && (
        <p id="newsletter-error" role="alert" className="mt-2 pl-5 text-xs text-danger">
          {err}
        </p>
      )}
    </form>
  );
}
