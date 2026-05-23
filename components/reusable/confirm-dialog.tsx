"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  isLoading?: boolean;
  onConfirm?: () => void;
  children?: React.ReactNode;
  formId?: string;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  isLoading = false,
  onConfirm,
  children,
  formId,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:w-90 w-70 rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {!children ? description : null}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {children && <div className="py-1">{children}</div>}

        <AlertDialogFooter className="flex-row gap-2 sm:flex-row">
          <AlertDialogCancel
            disabled={isLoading}
            className="flex-1 h-10 text-sm rounded-xl mt-0"
          >
            {cancelLabel}
          </AlertDialogCancel>

          {formId ? (
            <button
              type="submit"
              form={formId}
              disabled={isLoading}
              className={`flex-1 h-10 text-sm rounded-xl flex items-center justify-center gap-2 font-medium ${
                variant === "destructive"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {confirmLabel}
            </button>
          ) : (
            <AlertDialogAction
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                onConfirm?.();
              }}
              className={`flex-1 h-10 text-sm rounded-xl flex items-center justify-center gap-2 ${
                variant === "destructive"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : ""
              }`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {confirmLabel}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
