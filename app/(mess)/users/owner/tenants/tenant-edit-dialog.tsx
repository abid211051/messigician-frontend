"use client";

import { useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from "@/components/reusable/confirm-dialog";
import { EditTenantDialogProps } from "./types";
import { EditTenantFormValues, editTenantSchema } from "./validation";

const FORM_ID = "edit-tenant-form";

export default function EditTenantDialog({
  open,
  onOpenChange,
  tenant,
  subMesses,
  isLoading = false,
  onSave,
}: EditTenantDialogProps) {
  const {
    control,
    handleSubmit,
    reset,

    formState: { errors },
  } = useForm<EditTenantFormValues>({
    resolver: zodResolver(editTenantSchema),
    defaultValues: { sub_mess_id: "", monthly_rent: 0, total_due: 0 },
  });

  useEffect(() => {
    if (open && tenant) {
      reset({
        sub_mess_id: tenant.sub_mess_id,
        monthly_rent: tenant.monthly_rent ?? 0,
        total_due: tenant.total_due ?? 0,
      });
    }
  }, [tenant, reset, open]);

  const onSubmit: SubmitHandler<EditTenantFormValues> = async (values) => {
    if (!tenant) return;
    await onSave(tenant.id, values);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Member"
      confirmLabel="Save"
      cancelLabel="Cancel"
      variant="default"
      isLoading={isLoading}
      formId={FORM_ID}
    >
      {tenant && (
        <p className="text-sm font-bold text-muted-foreground mb-3">
          {tenant?.tenant_name}
        </p>
      )}

      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Sub-mess
          </label>
          <Controller
            control={control}
            name="sub_mess_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={`w-full min-h-11 rounded-xl bg-card ${errors.sub_mess_id ? "border-red-400" : ""}`}
                >
                  <SelectValue placeholder="Select sub-mess" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={0}
                  className="max-h-52"
                >
                  {subMesses.map((s) => (
                    <SelectItem className="min-h-9" key={s.id} value={s.id}>
                      {s.sub_mess_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.sub_mess_id && (
            <p className="text-xs text-red-500">{errors.sub_mess_id.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Monthly Rent
          </label>
          <Controller
            control={control}
            name="monthly_rent"
            render={({ field }) => (
              <Input
                value={field.value ?? ""}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  field.onChange(
                    val === "" || Number.isNaN(Number(val))
                      ? ""
                      : parseFloat(val),
                  );
                }}
                onKeyDown={(e) => {
                  if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
                }}
                onBlur={field.onBlur}
                type="number"
                placeholder="e.g. 3500"
                className={`min-h-11 rounded-xl bg-card ${errors.monthly_rent ? "border-red-400" : ""}`}
              />
            )}
          />
          {errors.monthly_rent && (
            <p className="text-xs text-red-500">
              {errors.monthly_rent.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Total Due
          </label>
          <Controller
            control={control}
            name="total_due"
            render={({ field }) => (
              <Input
                value={field.value ?? ""}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  field.onChange(
                    val === "" || Number.isNaN(Number(val))
                      ? ""
                      : parseFloat(val),
                  );
                }}
                onKeyDown={(e) => {
                  if (["e", "E"].includes(e.key)) e.preventDefault();
                }}
                onBlur={field.onBlur}
                type="number"
                placeholder="e.g. 5000"
                className={`min-h-11 rounded-xl bg-card ${errors.total_due ? "border-red-400" : ""}`}
              />
            )}
          />
          {errors.total_due && (
            <p className="text-xs text-red-500">{errors.total_due.message}</p>
          )}
        </div>
      </form>
    </ConfirmDialog>
  );
}
