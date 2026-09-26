"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, CreditCard, Lock, ShieldCheck, Tag, TriangleAlert, X } from "lucide-react";
import type { Plan } from "@/lib/types";
import { checkoutProfileSchema, type CheckoutProfileInput } from "@/lib/validation";
import { api, applyFieldErrors, ClientApiError } from "@/lib/client-api";
import { Field, fieldA11y } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { LoginForm, SignupForm } from "@/components/forms/auth-forms";
import { cn, formatDate, inr } from "@/lib/utils";

type Gateway = "razorpay" | "demo" | "disabled";
type Order = { mode: Gateway; orderId: string; paymentId: string; amount: number; keyId?: string; plan: { name: string }; prefill: { name: string; email: string; contact?: string } };
type Quote = { subtotal: number; discount: number; total: number; coupon: { code: string; description: string } | null; couponError?: string };

const STEPS = ["Plan", "Registration", "Payment", "Active"] as const;

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: { error: { description: string; reason: string } }) => void) => void };
  }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function CheckoutFlow({
  plan,
  plans,
  user,
  profile,
  active,
  gateway,
  initialStep = 0,
}: {
  initialStep?: 0 | 1 | 2;
  plan: Plan;
  plans: { slug: string; name: string; price: number; durationMonths: number }[];
  user: { name: string; email: string; role: string } | null;
  profile: Partial<CheckoutProfileInput> | null;
  active: { planName: string; end: string } | null;
  gateway: Gateway;
}) {
  const router = useRouter();
  const profileComplete = Boolean(profile?.dateOfBirth && profile?.gender && profile?.emergencyContactPhone);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(initialStep);
  const [coupon, setCoupon] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [applying, setApplying] = useState(false);
  const [paying, setPaying] = useState(false);
  const [demoOrder, setDemoOrder] = useState<Order | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const total = quote?.total ?? plan.price;

  const applyCoupon = async () => {
    if (!user) return toast.message("Sign in first to apply a code.");
    setApplying(true);
    try {
      const q = await api<Quote>("/api/payments/quote", { body: { planSlug: plan.slug, couponCode: coupon } });
      setQuote(q);
      if (q.couponError) toast.error(q.couponError);
      else if (q.coupon) toast.success(`${q.coupon.code} applied — you save ${inr(q.discount)}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setApplying(false);
    }
  };

  const finish = (paymentId?: string) => {
    setStep(3);
    setTimeout(() => router.push(`/checkout/success${paymentId ? `?payment=${paymentId}` : ""}`), 1400);
  };

  const pay = async () => {
    setFailure(null);
    setPaying(true);
    try {
      const order = await api<Order>("/api/payments/order", { body: { planSlug: plan.slug, couponCode: quote?.coupon?.code ?? "" } });
      if (order.mode === "demo") {
        setDemoOrder(order);
        setPaying(false);
        return;
      }
      if (!(await loadRazorpay()) || !window.Razorpay) throw new Error("Couldn't load the payment window. Check your connection and try again.");
      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: "INR",
        name: "ATHLEX",
        description: `${order.plan.name} membership`,
        prefill: order.prefill,
        theme: { color: "#c8ff2e" },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const v = await api<{ paymentId: string }>("/api/payments/verify", { body: resp });
            finish(v.paymentId);
          } catch (e) {
            // The webhook will still settle a genuinely captured payment.
            setFailure(`${(e as Error).message} If money was debited, your membership will activate automatically within a few minutes.`);
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: async () => {
            setPaying(false);
            await api("/api/payments/status", { body: { orderId: order.orderId, status: "cancelled" } }).catch(() => {});
            toast.message("Payment cancelled", { description: "No money was taken. You can try again anytime." });
          },
        },
      });
      rzp.on("payment.failed", async (r) => {
        setFailure(r.error.description || "Payment failed.");
        await api("/api/payments/status", { body: { orderId: order.orderId, status: "failed", reason: r.error.description } }).catch(() => {});
      });
      rzp.open();
    } catch (e) {
      setPaying(false);
      if (e instanceof ClientApiError && e.status === 401) return setStep(1);
      setFailure((e as Error).message);
    }
  };

  const demoOutcome = async (outcome: "success" | "failed" | "cancelled") => {
    if (!demoOrder) return;
    setPaying(true);
    try {
      const r = await api<{ status: string; paymentId?: string }>("/api/payments/demo", { body: { orderId: demoOrder.orderId, outcome } });
      setDemoOrder(null);
      if (r.status === "paid") finish(r.paymentId);
      else if (outcome === "failed") setFailure("Card declined by issuing bank (simulated). No money was taken.");
      else toast.message("Payment cancelled", { description: "No money was taken." });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <p className="eyebrow">Checkout</p>
        <h1 className="display mt-3 text-5xl sm:text-7xl">
          {plan.name} <span className="text-outline">membership</span>
        </h1>

        {/* Stepper */}
        <ol className="mt-10 grid grid-cols-4 gap-2" aria-label="Checkout progress">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? "step" : undefined}>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full bg-volt" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
              </div>
              <p className={cn("mt-2 font-mono text-[0.7rem] uppercase tracking-[0.18em]", i <= step ? "text-bone" : "text-ash")}>
                <span className="text-volt">0{i + 1}</span> <span className="hidden sm:inline">{s}</span>
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <Panel key="plan">
                <h2 className="display text-3xl">Confirm your plan</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {plans.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/checkout/${p.slug}`}
                      replace
                      className={cn("flex items-center justify-between rounded-[var(--radius-card)] border p-5 transition", p.slug === plan.slug ? "border-volt bg-volt/10" : "border-white/10 hover:border-white/30")}
                      aria-current={p.slug === plan.slug ? "true" : undefined}
                    >
                      <span>
                        <span className="display block text-2xl">{p.name}</span>
                        <span className="text-xs text-smoke">
                          {p.durationMonths} month{p.durationMonths > 1 ? "s" : ""}
                        </span>
                      </span>
                      <span className="font-semibold">{inr(p.price)}</span>
                    </Link>
                  ))}
                </div>
                {active && (
                  <p className="mt-6 flex items-start gap-2 rounded-[var(--radius-card)] border border-white/10 bg-graphite p-4 text-sm text-smoke">
                    <Check className="mt-0.5 size-4 shrink-0 text-volt" /> You have an active {active.planName} membership until {formatDate(active.end)}. This purchase will start the day after it ends.
                  </p>
                )}
                <Button size="lg" arrow className="mt-8" onClick={() => setStep(1)}>
                  Continue
                </Button>
              </Panel>
            )}

            {step === 1 && (
              <Panel key="reg">
                {!user ? (
                  <AuthStep planSlug={plan.slug} />
                ) : (
                  <ProfileStep
                    profile={profile}
                    complete={profileComplete}
                    user={user}
                    onBack={() => setStep(0)}
                    onDone={() => {
                      setStep(2);
                      router.refresh();
                    }}
                  />
                )}
              </Panel>
            )}

            {step === 2 && (
              <Panel key="pay">
                <h2 className="display text-3xl">Payment</h2>
                <p className="mt-2 text-sm text-smoke">You&apos;ll be charged {inr(total)} once. Your membership activates immediately after we verify the payment.</p>
                {gateway === "disabled" ? (
                  <p className="mt-6 rounded border border-warn/30 bg-warn/10 p-4 text-sm text-warn">Online payments are currently unavailable. Please visit the front desk or contact us on WhatsApp.</p>
                ) : (
                  <>
                    <div className="mt-6 flex flex-wrap gap-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-smoke">
                      {["UPI", "Cards", "Net banking", "Wallets", "EMI"].map((m) => (
                        <span key={m} className="rounded-full border border-white/10 px-3 py-1.5">
                          {m}
                        </span>
                      ))}
                    </div>
                    {failure && (
                      <div role="alert" className="mt-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                        <div>
                          <p className="font-semibold">Payment unsuccessful</p>
                          <p className="mt-1 text-danger/80">{failure}</p>
                        </div>
                      </div>
                    )}
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <Button size="lg" onClick={pay} loading={paying}>
                        <Lock className="size-4" /> {failure ? "Retry payment" : `Pay ${inr(total)}`}
                      </Button>
                      <button onClick={() => setStep(1)} className="text-sm text-smoke hover:text-bone">
                        Back
                      </button>
                    </div>
                    <p className="mt-6 flex items-center gap-2 text-xs text-ash">
                      <ShieldCheck className="size-4 text-volt" /> {gateway === "razorpay" ? "Secured by Razorpay. We never see or store your card details." : "Demo gateway — no real money is charged."}
                    </p>
                  </>
                )}
              </Panel>
            )}

            {step === 3 && (
              <Panel key="done">
                <div className="flex flex-col items-center py-10 text-center" role="status">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="grid size-24 place-items-center rounded-full bg-volt text-ink">
                    <Check className="size-12" strokeWidth={3} />
                  </motion.div>
                  <h2 className="display mt-8 text-5xl">Membership created</h2>
                  <p className="mt-3 text-smoke">Payment verified. Preparing your receipt…</p>
                </div>
              </Panel>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Order summary */}
      <aside className="lg:col-span-4">
        <div className="sticky top-28 rounded-[var(--radius-card)] border border-white/[0.08] bg-graphite p-6 sm:p-8">
          <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-smoke">Order summary</h2>
          <p className="display mt-4 text-4xl">{plan.name}</p>
          <p className="text-sm text-smoke">
            {plan.durationMonths} month{plan.durationMonths > 1 ? "s" : ""} · {plan.durationDays} days
          </p>
          <ul className="mt-6 space-y-2 border-t border-white/[0.08] pt-6 text-sm">
            {plan.features.slice(0, 4).map((f) => (
              <li key={f} className="flex gap-2 text-bone/80">
                <Check className="mt-0.5 size-3.5 shrink-0 text-volt" /> {f}
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-white/[0.08] pt-6">
            <label htmlFor="coupon" className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-smoke">
              <Tag className="size-3" /> Coupon code
            </label>
            <div className="mt-2 flex gap-2">
              <input id="coupon" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="WELCOME10" className="field h-11 py-0 uppercase" disabled={step === 3} />
              {quote?.coupon ? (
                <button
                  onClick={() => {
                    setQuote(null);
                    setCoupon("");
                  }}
                  aria-label="Remove coupon"
                  className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-card)] border border-white/10"
                >
                  <X className="size-4" />
                </button>
              ) : (
                <Button variant="outline" size="sm" className="h-11 shrink-0" onClick={applyCoupon} loading={applying} disabled={!coupon}>
                  Apply
                </Button>
              )}
            </div>
            {quote?.couponError && <p className="mt-2 text-xs text-danger">{quote.couponError}</p>}
          </div>

          <dl className="mt-6 space-y-2 border-t border-white/[0.08] pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-smoke">Subtotal</dt>
              <dd>{inr(quote?.subtotal ?? plan.price)}</dd>
            </div>
            {quote?.discount ? (
              <div className="flex justify-between text-volt">
                <dt>Discount ({quote.coupon?.code})</dt>
                <dd>−{inr(quote.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-smoke">GST</dt>
              <dd className="text-smoke">Included</dd>
            </div>
            <div className="flex items-end justify-between border-t border-white/[0.08] pt-4">
              <dt className="font-semibold">Total</dt>
              <dd className="display text-4xl">{inr(total)}</dd>
            </div>
          </dl>
          <p className="mt-4 flex items-center gap-2 text-xs text-ash">
            <CreditCard className="size-3.5" /> Final amount is calculated and verified on our server.
          </p>
        </div>
      </aside>

      <Dialog open={Boolean(demoOrder)} onClose={() => demoOutcome("cancelled")} title="Demo payment" description="Razorpay keys aren't configured, so this simulated gateway lets you test every outcome." size="sm">
        <div className="rounded-[var(--radius-card)] border border-white/10 bg-ink p-5">
          <p className="font-mono text-xs text-smoke">{demoOrder?.orderId}</p>
          <p className="display mt-2 text-4xl">{demoOrder && inr(demoOrder.amount)}</p>
          <p className="text-sm text-smoke">{demoOrder?.plan.name} membership</p>
        </div>
        <div className="mt-6 grid gap-2">
          <Button onClick={() => demoOutcome("success")} loading={paying}>
            Simulate successful payment
          </Button>
          <Button variant="outline" onClick={() => demoOutcome("failed")} disabled={paying}>
            Simulate failed payment
          </Button>
          <Button variant="ghost" onClick={() => demoOutcome("cancelled")} disabled={paying}>
            Cancel
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.section>
  );
}

function AuthStep({ planSlug }: { planSlug: string }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const next = `/checkout/${planSlug}?step=1`;
  return (
    <>
      <h2 className="display text-3xl">{mode === "signup" ? "Create your account" : "Sign in to continue"}</h2>
      <p className="mb-8 mt-2 text-sm text-smoke">Your account holds your membership, receipts, QR check-in and progress.</p>
      {mode === "signup" ? <SignupForm next={next} /> : <LoginForm next={next} />}
      <p className="mt-6 text-sm text-smoke">
        {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
        <button onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="font-semibold text-volt hover:underline">
          {mode === "signup" ? "Sign in" : "Create an account"}
        </button>
      </p>
    </>
  );
}

function ProfileStep({ profile, complete, user, onDone, onBack }: { profile: Partial<CheckoutProfileInput> | null; complete: boolean; user: { name: string; email: string }; onDone: () => void; onBack: () => void }) {
  const { register, handleSubmit, formState, setError } = useForm<CheckoutProfileInput>({
    resolver: zodResolver(checkoutProfileSchema),
    defaultValues: { ...(profile ?? {}), fullName: profile?.fullName || user.name, acceptWaiver: complete ? true : undefined } as CheckoutProfileInput,
  });
  const e = formState.errors;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onSubmit = handleSubmit(async (v) => {
    try {
      await api("/api/checkout/profile", { body: v });
      onDone();
    } catch (err) {
      applyFieldErrors(err, setError as never);
      toast.error((err as Error).message);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <h2 className="display text-3xl">Member registration</h2>
      <p className="mb-8 mt-2 text-sm text-smoke">
        Signed in as <span className="text-bone">{user.email}</span>. A few details so your coach can train you safely.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="co-name" label="Full name" error={e.fullName?.message} required>
          <input className="field" autoComplete="name" {...fieldA11y("co-name", e.fullName?.message)} {...register("fullName")} />
        </Field>
        <Field id="co-phone" label="Phone" error={e.phone?.message} required>
          <input className="field" type="tel" autoComplete="tel" {...fieldA11y("co-phone", e.phone?.message)} {...register("phone")} />
        </Field>
        <Field id="co-dob" label="Date of birth" error={e.dateOfBirth?.message} required>
          <input className="field" type="date" autoComplete="bday" {...fieldA11y("co-dob", e.dateOfBirth?.message)} {...register("dateOfBirth")} />
        </Field>
        <Field id="co-gender" label="Gender" error={e.gender?.message} required>
          <select className="field" {...fieldA11y("co-gender", e.gender?.message)} {...register("gender")}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other / prefer not to say</option>
          </select>
        </Field>
        <Field id="co-goal" label="Main fitness goal" error={e.fitnessGoal?.message} required className="sm:col-span-2">
          <input className="field" placeholder="e.g. Lose 8 kg, deadlift 150 kg, run 10k" {...fieldA11y("co-goal", e.fitnessGoal?.message)} {...register("fitnessGoal")} />
        </Field>
        <Field id="co-ecn" label="Emergency contact" error={e.emergencyContactName?.message} required>
          <input className="field" {...fieldA11y("co-ecn", e.emergencyContactName?.message)} {...register("emergencyContactName")} />
        </Field>
        <Field id="co-ecp" label="Emergency phone" error={e.emergencyContactPhone?.message} required>
          <input className="field" type="tel" {...fieldA11y("co-ecp", e.emergencyContactPhone?.message)} {...register("emergencyContactPhone")} />
        </Field>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm text-smoke">
            <input type="checkbox" className="mt-1 size-4 accent-[#c8ff2e]" {...register("acceptWaiver")} />
            <span>
              I confirm I&apos;m fit to exercise and accept the{" "}
              <Link href="/terms" target="_blank" className="text-bone underline">
                membership terms & health waiver
              </Link>
              .
            </span>
          </label>
          {e.acceptWaiver && (
            <p role="alert" className="mt-2 text-xs text-danger">
              {e.acceptWaiver.message}
            </p>
          )}
        </div>
      </div>
      <div className="mt-8 flex items-center gap-4">
        <Button type="submit" size="lg" arrow loading={formState.isSubmitting}>
          Continue to payment
        </Button>
        <button type="button" onClick={onBack} className="text-sm text-smoke hover:text-bone">
          Back
        </button>
      </div>
    </form>
  );
}
