"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { measurementSchema, type MeasurementInput } from "@/lib/validation";
import { api } from "@/lib/client-api";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, fieldA11y } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/misc";
import { formatDate, toISODate } from "@/lib/utils";

export function AddMeasurement() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState, reset } = useForm<MeasurementInput>({ resolver: zodResolver(measurementSchema), defaultValues: { measuredOn: toISODate(new Date()) } });
  const e = formState.errors;
  const onSubmit = handleSubmit(async (v) => {
    try {
      await api("/api/progress/measurements", { body: v });
      toast.success("Measurement saved");
      setOpen(false);
      reset({ measuredOn: toISODate(new Date()) });
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  });
  const num = (name: keyof MeasurementInput, label: string, unit: string) => (
    <Field id={`m-${name}`} label={`${label} (${unit})`} error={e[name]?.message as string | undefined}>
      <input className="field" type="number" step="0.1" inputMode="decimal" {...fieldA11y(`m-${name}`, e[name]?.message as string | undefined)} {...register(name)} />
    </Field>
  );
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Log measurement
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="New check-in" description="Only weight is required." size="lg">
        <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-3">
          <Field id="m-date" label="Date" error={e.measuredOn?.message}>
            <input className="field" type="date" max={toISODate(new Date())} {...register("measuredOn")} />
          </Field>
          {num("weightKg", "Weight", "kg")}
          {num("bodyFatPct", "Body fat", "%")}
          {num("chestCm", "Chest", "cm")}
          {num("waistCm", "Waist", "cm")}
          {num("hipsCm", "Hips", "cm")}
          {num("armsCm", "Arms", "cm")}
          {num("thighsCm", "Thighs", "cm")}
          <Field id="m-notes" label="Notes" className="sm:col-span-3">
            <input className="field" {...register("notes")} />
          </Field>
          <div className="flex justify-end gap-2 sm:col-span-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={formState.isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export function DeleteMeasurement({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      aria-label="Delete measurement"
      disabled={busy}
      onClick={async () => {
        if (!confirm("Delete this measurement?")) return;
        setBusy(true);
        try {
          await api(`/api/progress/measurements/${id}`, { method: "DELETE" });
          toast.success("Deleted");
          router.refresh();
        } catch (err) {
          toast.error((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
      className="grid size-8 place-items-center rounded-full text-ash hover:bg-danger/10 hover:text-danger"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}

export function ProgressPhotos({ photos }: { photos: { id: string; url: string | null; takenOn: string; caption: string | null }[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("takenOn", toISODate(new Date()));
    setUploading(true);
    try {
      const res = await fetch("/api/progress/photos", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      toast.success("Photo uploaded — only you and your coach can see it.");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await api(`/api/progress/photos/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" id="photo-upload" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      {photos.length === 0 ? (
        <EmptyState icon={<ImagePlus className="size-5" />} title="No photos yet" action={<Button size="sm" onClick={() => input.current?.click()} loading={uploading}>Upload photo</Button>}>
          Private progress photos are the best way to see change the scale misses.
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <li>
            <button onClick={() => input.current?.click()} disabled={uploading} className="grid aspect-[3/4] w-full place-items-center rounded-md border border-dashed border-white/15 text-smoke transition hover:border-volt hover:text-volt">
              <span className="flex flex-col items-center gap-2 text-xs">
                <ImagePlus className="size-6" /> {uploading ? "Uploading…" : "Add photo"}
              </span>
            </button>
          </li>
          {photos.map((p) => (
            <li key={p.id} className="group relative aspect-[3/4] overflow-hidden rounded-md bg-graphite">
              {p.url && (
                // eslint-disable-next-line @next/next/no-img-element -- signed/private URLs bypass the image optimizer
                <img src={p.url} alt={`Progress photo from ${formatDate(p.takenOn)}`} className="size-full object-cover" loading="lazy" />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent p-2 font-mono text-[0.7rem]">{formatDate(p.takenOn)}</span>
              <button onClick={() => remove(p.id)} aria-label="Delete photo" className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-ink/70 text-bone opacity-100 transition hover:text-danger sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100">
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
