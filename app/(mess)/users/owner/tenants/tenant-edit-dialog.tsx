"use client";

import { useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { NumericInput } from "@/components/reusable/numeric-field";

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
    defaultValues: { sub_mess_id: "", monthly_rent: null, total_due: null },
  });

  useEffect(() => {
    if (open && tenant) {
      const rent = tenant.monthly_rent ?? null;
      const due = tenant.total_due ?? null;
      reset({
        sub_mess_id: tenant.sub_mess_id,
        monthly_rent: rent,
        total_due: due,
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
          {tenant.tenant_name}
        </p>
      )}

      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {/* Sub-mess */}
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

        {/* Monthly Rent — non-negative only */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Monthly Rent
          </label>
          <Controller
            control={control}
            name="monthly_rent"
            render={({ field }) => (
              <NumericInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                allowNegative={false}
                allowDecimal={true}
                emptyAs="null"
                placeholder="e.g. 8000"
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

        {/* Total Due — any number including negative */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Total Due
          </label>
          <Controller
            control={control}
            name="total_due"
            render={({ field }) => (
              <NumericInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                allowNegative={true}
                allowDecimal={true}
                emptyAs="null"
                placeholder="e.g. 8000"
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
