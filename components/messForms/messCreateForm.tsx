"use client";

import { Upload, X, UtensilsCrossed } from "lucide-react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";

import {
  createMessSchema,
  type CreateMessFormValues,
} from "@/lib/validations/mess.validation";

const MessCreationForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateMessFormValues>({
    resolver: zodResolver(createMessSchema),
    defaultValues: { fname: "", file: undefined },
  });

  const onSubmit: SubmitHandler<CreateMessFormValues> = async (data) => {
    const formData = new FormData();
    formData.append("fname", data.fname);
    if (data.file) formData.append("file", data.file);
    console.log("submitting:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Mess name
        </label>
        <Controller
          control={control}
          name="fname"
          render={({ field }) => (
            <Input
              {...field}
              placeholder="e.g. Sunshine Mess"
              className={
                errors.fname
                  ? "border-red-400 focus-visible:ring-red-300 min-h-10"
                  : "min-h-10"
              }
            />
          )}
        />
        {errors.fname && (
          <p className="text-xs text-red-500">{errors.fname.message}</p>
        )}
      </div>

      {/* file */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Cover image
          <span className="normal-case ml-1 text-muted-foreground/60">
            (optional)
          </span>
        </label>
        <Controller
          control={control}
          name="file"
          render={({ field: { value, onChange } }) => (
            <FileUpload
              value={value ? [value] : []}
              onValueChange={(files) => onChange(files[0] ?? undefined)}
              maxFiles={1}
              className="w-full"
            >
              {!value ? (
                <FileUploadDropzone className="border-border rounded-xl">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="bg-brand-primary-muted p-2.5 rounded-xl">
                      <Upload className="size-5 text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Upload cover image
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        JPEG, PNG or WEBP — max 2MB
                      </p>
                    </div>
                    <FileUploadTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="mt-1 text-xs h-8"
                      >
                        Browse file
                      </Button>
                    </FileUploadTrigger>
                  </div>
                </FileUploadDropzone>
              ) : (
                <FileUploadList>
                  <FileUploadItem value={value}>
                    <div className="flex items-center gap-3 p-2 border border-border rounded-xl bg-card w-full">
                      <FileUploadItemPreview className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <FileUploadItemMetadata className="flex-1 min-w-0 text-sm" />
                      <FileUploadItemDelete asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          className="size-7 shrink-0 text-muted-foreground hover:text-red-500"
                          onClick={() => onChange(undefined)}
                        >
                          <X className="size-4" />
                        </Button>
                      </FileUploadItemDelete>
                    </div>
                  </FileUploadItem>
                </FileUploadList>
              )}
            </FileUpload>
          )}
        />
        {errors.file && (
          <p className="text-xs text-red-500">{errors.file.message}</p>
        )}
      </div>

      <div className="flex items-start gap-2.5 bg-brand-primary-muted border border-brand-primary-border rounded-xl p-3">
        <UtensilsCrossed className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
        <p className="text-xs text-brand-primary leading-relaxed">
          You'll be the owner of this mess and can manage members, meals and
          expenses.
        </p>
      </div>

      <Button
        type="submit"
        className="h-11 bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.98] rounded-xl transition-all duration-150"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create mess"}
      </Button>
    </form>
  );
};

export default MessCreationForm;
