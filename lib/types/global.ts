import { ErrorArray } from "@/lib/helpers/errors";

export interface CUDResponse {
  success: boolean;
  message?: string;
  error?: ErrorArray[];
}
