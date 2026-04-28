"use client";

import { useState } from "react";
import { Search, Users, Loader2 } from "lucide-react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  joinMessSchema,
  JoinMessFormValues,
} from "@/lib/validations/mess.validation";
import { MessSearchResult } from "@/lib/types/onboard";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import {
  searchSubMessListApi,
  joinRequestApi,
} from "@/app/onboard/actions/onboard.action";

const MessJoinForm = () => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [foundMess, setFoundMess] = useState<MessSearchResult[] | null>(null);
  const [confirmedMessId, setConfirmedMessId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<JoinMessFormValues>({
    resolver: zodResolver(joinMessSchema),
    defaultValues: { mess_id: "", sub_mess_id: "placeholder" },
  });

  const handleMessIdChange = (
    value: string,
    rhfOnChange: (v: string) => void,
  ) => {
    rhfOnChange(value);
    clearErrors("mess_id");

    if (confirmedMessId !== null && value !== confirmedMessId) {
      setFoundMess(null);
      setConfirmedMessId(null);
      setValue("sub_mess_id", "placeholder");
    }
  };

  const handleSearch = async () => {
    const isValid = await trigger("mess_id");
    if (!isValid) return;

    const messId = getValues("mess_id");

    setIsSearching(true);
    setFoundMess(null);
    setConfirmedMessId(null);
    setValue("sub_mess_id", "placeholder");

    try {
      const result = await searchSubMessListApi(messId);
      if (result.data) {
        setFoundMess(result.data?.data);
        setConfirmedMessId(messId);
        toast.success(`Mess Found. Select a Sub-Mess`, {
          position: "top-center",
          richColors: true,
        });
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(
          err.response?.data?.message ?? "No mess found with that ID",
          { position: "top-center", richColors: true },
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit: SubmitHandler<JoinMessFormValues> = async (data) => {
    if (!confirmedMessId || !foundMess) {
      toast.error("Please search and select a valid mess first.", {
        position: "top-center",
        richColors: true,
      });
      return;
    }

    try {
      await joinRequestApi({
        mess_id: confirmedMessId,
        sub_mess_id: data.sub_mess_id,
      });
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.message ?? "Something went wrong", {
          position: "top-center",
          richColors: true,
        });
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="bg-brand-secondary-muted p-3 rounded-full">
          <Users className="size-6 text-brand-secondary" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-foreground">Request Sent!</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You will be notified once the mess owner approves your request.
          </p>
        </div>
        <button
          onClick={() => setIsSuccess(false)}
          className="text-sm text-brand-secondary underline underline-offset-4 mt-1"
        >
          Send a new join request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Mess ID
        </label>

        <div className="flex gap-2">
          <Controller
            control={control}
            name="mess_id"
            render={({ field }) => (
              <Input
                {...field}
                onChange={(e) =>
                  handleMessIdChange(e.target.value, field.onChange)
                }
                placeholder="e.g. MESS-4X9Z2"
                disabled={isSearching || isSubmitting}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleSearch())
                }
                className={`${
                  errors.mess_id
                    ? "border-red-400 focus-visible:ring-red-300"
                    : ""
                } bg-card min-h-12 flex-1`}
              />
            )}
          />

          <Button
            type="button"
            variant="outline"
            onClick={handleSearch}
            disabled={isSearching || isSubmitting}
            className="shrink-0 border-secondary min-h-12 px-4 rounded-xl font-medium"
          >
            {isSearching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
          </Button>
        </div>

        {errors.mess_id && (
          <p className="text-xs text-red-500">{errors.mess_id.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Sub-mess
        </label>

        <Controller
          control={control}
          name="sub_mess_id"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!foundMess || isSubmitting}
            >
              <SelectTrigger
                className={`${
                  errors.sub_mess_id
                    ? "border-red-400 focus-visible:ring-red-300"
                    : ""
                } bg-card w-full min-h-12 rounded-xl`}
              >
                <SelectValue
                  placeholder={
                    foundMess ? "Select a sub-mess" : "Search for a mess first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="placeholder"
                  disabled
                  className="text-muted-foreground"
                >
                  — Select a sub-mess —
                </SelectItem>
                {foundMess?.map((sub) => (
                  <SelectItem
                    key={sub.id}
                    value={sub.id}
                    className="py-2.5 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-brand-secondary shrink-0" />
                      <span className="font-medium">{sub.fname}</span>
                    </div>
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

      <div className="flex items-start gap-2.5 bg-brand-secondary-muted border border-brand-secondary-border rounded-xl p-3">
        <Users className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
        <p className="text-xs text-brand-secondary leading-relaxed">
          Your request will be sent to the mess owner for approval. You'll be
          notified once accepted.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 active:scale-[0.96] rounded-xl h-11"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 active:scale-[0.96] bg-brand-secondary hover:bg-brand-secondary-hover font-medium rounded-xl h-11"
          disabled={!foundMess || isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Request"}
        </Button>
      </div>
    </form>
  );
};

export default MessJoinForm;
