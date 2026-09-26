"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { password, profileSchema, type ProfileInput } from "@/lib/validation";
import { api, applyFieldErrors } from "@/lib/client-api";
import { Field, fieldA11y } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function ProfileForm({ defaults, email }: { defaults: ProfileInput; email: string }) {
  const router = useRouter();
  const { register, handleSubmit, formState, setError } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: defaults });
  const e = formState.errors;
  const onSubmit = handleSubmit(async (v) => {
    try {
      await api("/api/profile", { method: "PATCH", body: v });
      toast.success("Profile updated");
      router.refresh();
    } catch (err) {
      applyFieldErrors(err, setError as never);
      toast.error((err as Error).message);
    }
  });
  const text = (name: keyof ProfileInput, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field id={`p-${name}`} label={label} error={e[name]?.message as string | undefined}>
      <input className="field" {...props} {...fieldA11y(`p-${name}`, e[name]?.message as string | undefined)} {...register(name)} />
    </Field>
  );
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      {text("fullName", "Full name", { autoComplete: "name" })}
      <Field id="p-email" label="Email" hint="Contact the front desk to change your email">
        <input id="p-email" className="field opacity-60" value={email} readOnly />
      </Field>
      {text("phone", "Phone", { type: "tel", autoComplete: "tel" })}
      {text("dateOfBirth", "Date of birth", { type: "date" })}
      <Field id="p-gender" label="Gender">
        <select id="p-gender" className="field" {...register("gender")}>
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </Field>
      {text("heightCm", "Height (cm)", { type: "number", inputMode: "numeric" })}
      {text("fitnessGoal", "Fitness goal")}
      {text("address", "Address", { autoComplete: "street-address" })}
      {text("emergencyContactName", "Emergency contact")}
      {text("emergencyContactPhone", "Emergency phone", { type: "tel" })}
      <div className="sm:col-span-2">
        <Button type="submit" loading={formState.isSubmitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

const pwSchema = z
  .object({ currentPassword: z.string().min(1, "Required"), newPassword: password, confirm: z.string() })
  .refine((d) => d.newPassword === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

export function PasswordForm() {
  const { register, handleSubmit, formState, reset, setError } = useForm<z.input<typeof pwSchema>>({ resolver: zodResolver(pwSchema) });
  const e = formState.errors;
  const onSubmit = handleSubmit(async (v) => {
    try {
      await api("/api/auth/password", { body: { currentPassword: v.currentPassword, newPassword: v.newPassword } });
      toast.success("Password changed");
      reset();
    } catch (err) {
      applyFieldErrors(err, setError as never);
      toast.error((err as Error).message);
    }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field id="pw-current" label="Current password" error={e.currentPassword?.message}>
        <input className="field" type="password" autoComplete="current-password" {...fieldA11y("pw-current", e.currentPassword?.message)} {...register("currentPassword")} />
      </Field>
      <Field id="pw-new" label="New password" error={e.newPassword?.message}>
        <input className="field" type="password" autoComplete="new-password" {...fieldA11y("pw-new", e.newPassword?.message)} {...register("newPassword")} />
      </Field>
      <Field id="pw-confirm" label="Confirm new password" error={e.confirm?.message}>
        <input className="field" type="password" autoComplete="new-password" {...fieldA11y("pw-confirm", e.confirm?.message)} {...register("confirm")} />
      </Field>
      <Button type="submit" variant="outline" loading={formState.isSubmitting}>
        Change password
      </Button>
    </form>
  );
}
