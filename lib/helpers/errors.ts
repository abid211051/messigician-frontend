import axios from "axios";
import { toast } from "sonner";

export interface ErrorArray {
  message?: string;
  field?: string;
}

const toastDisplay = (errMsg: string) => {
  toast.error(errMsg, { richColors: true, position: "top-center" });
};

export function handleApiError(error: unknown) {
  let errMsg = "";
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const { data } = error.response;
      if (data?.errors) {
        errMsg = data.errors?.map((e: any) => e.message).join("\n");
      } else if (data?.message) {
        errMsg = data.message;
      }
      toastDisplay(errMsg);
      return errMsg;
    }
    if (error.request) {
      if (error.code === "ECONNABORTED") {
        errMsg = "Request timeout. Please try again.";
      } else if (error.code === "ERR_NETWORK") {
        errMsg = "Network error. Server is unreachable.";
      } else {
        errMsg = "No response received from the server.";
      }
      toastDisplay(errMsg);
      return errMsg;
    }
  } else {
    errMsg = "An unexpected error occurred";
    toastDisplay(errMsg);
    return errMsg;
  }
}
