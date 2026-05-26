"use client";

import { useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/reusable/confirm-dialog";
import { CreateSubMessBody } from "./action";
import { CreateSubMessFormValues, createSubMessSchema } from "./validation";

const FORM_ID = "create-sub-mess-form";

interface CreateSubMessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onSave: (body: CreateSubMessBody) => Promise<void>;
}

export default function CreateSubMessDialog({
  open,
  onOpenChange,
  isLoading = false,
  onSave,
}: CreateSubMessDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSubMessFormValues>({
    resolver: zodResolver(createSubMessSchema),
    defaultValues: { fname: "", total_rent: undefined, no_of_seats: undefined },
  });

  useEffect(() => {
    if (open)
      reset({ fname: "", total_rent: undefined, no_of_seats: undefined });
  }, [open, reset]);

  const onSubmit: SubmitHandler<CreateSubMessFormValues> = async (values) => {
    await onSave({
      fname: values.fname,
      ...(values.total_rent !== undefined && { total_rent: values.total_rent }),
      ...(values.no_of_seats !== undefined && {
        no_of_seats: values.no_of_seats,
      }),
    });
  };

  // ── Shared number onChange helper ─────────────────────────────────────────
  // Uses valueAsNumber so the browser's own parsing decides the value.
  // • Empty field  → NaN → undefined  (field treated as not filled in)
  // • "3e2"        → 300             (valid; backend nonnegative check passes)
  // • "-5"         → -5             (NaN on most browsers after onKeyDown blocks
  //                                  "-"; pasted negatives hit zod nonnegative)
  // • "3.5" in seats → 3.5          (zod .int() rejects it immediately)
  const toNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = e.target.valueAsNumber;
    return isNaN(n) ? undefined : n;
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Sub-Mess"
      confirmLabel="Create"
      cancelLabel="Cancel"
      variant="default"
      isLoading={isLoading}
      formId={FORM_ID}
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Name <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="fname"
            render={({ field }) => (
              <Input
                {...field}
                placeholder="e.g. Block-A"
                className={`min-h-11 rounded-xl bg-card ${errors.fname ? "border-red-400" : ""}`}
              />
            )}
          />
          {errors.fname && (
            <p className="text-xs text-red-500">{errors.fname.message}</p>
          )}
        </div>

        {/* Total Rent */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Total Rent{" "}
            <span className="text-gray-400 normal-case font-normal">
              (optional)
            </span>
          </label>
          <Controller
            control={control}
            name="total_rent"
            render={({ field }) => (
              <Input
                value={field.value ?? ""}
                onChange={(e) => field.onChange(toNumber(e))}
                onKeyDown={(e) => {
                  // Block explicit minus/plus while typing; e/E are allowed
                  // since 3e2 → 300 is harmless and passes nonnegative check.
                  if (["-", "+"].includes(e.key)) e.preventDefault();
                }}
                onBlur={field.onBlur}
                type="number"
                min={0}
                placeholder="e.g. 8000"
                className={`min-h-11 rounded-xl bg-card ${errors.total_rent ? "border-red-400" : ""}`}
              />
            )}
          />
          {errors.total_rent && (
            <p className="text-xs text-red-500">{errors.total_rent.message}</p>
          )}
        </div>

        {/* No of Seats */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            No. of Seats{" "}
            <span className="text-gray-400 normal-case font-normal">
              (optional)
            </span>
          </label>
          <Controller
            control={control}
            name="no_of_seats"
            render={({ field }) => (
              <Input
                value={field.value ?? ""}
                onChange={(e) => field.onChange(toNumber(e))}
                onKeyDown={(e) => {
                  // Block minus, plus, and decimal point while typing.
                  // e/E (scientific) → valueAsNumber resolves to integer or NaN;
                  // zod .int() catches any non-integer that slips through.
                  if (["-", "+", "."].includes(e.key)) e.preventDefault();
                }}
                onBlur={field.onBlur}
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 4"
                className={`min-h-11 rounded-xl bg-card ${errors.no_of_seats ? "border-red-400" : ""}`}
              />
            )}
          />
          {errors.no_of_seats && (
            <p className="text-xs text-red-500">{errors.no_of_seats.message}</p>
          )}
        </div>
      </form>
    </ConfirmDialog>
  );
}
