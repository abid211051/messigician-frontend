import axios from "axios";
import { toast } from "sonner";

interface ErrorDetail {
  field?: string;
  message?: string;
}

interface ApiErrorResponse {
  message?: string | string[];
  error?: {
    message?: string | string[];
    details?: ErrorDetail[];
  };
  errors?: ErrorDetail[];
}

const toastDisplay = (message: string) => {
  if (typeof window === "undefined" || !message.trim()) return;

  toast.error(message, {
    richColors: true,
    position: "top-center",
  });
};

function getErrorMessage(data: ApiErrorResponse | null | undefined): string {
  if (!data) return "An unexpected error occurred";

  const details = data.error?.details ?? data.errors;

  if (Array.isArray(details) && details.length > 0) {
    return details
      .map((item) =>
        item.field
          ? `${item.field}: ${item.message ?? "Invalid value"}`
          : (item.message ?? "Invalid value"),
      )
      .join("\n");
  }

  const message = data.error?.message ?? data.message;

  if (Array.isArray(message)) {
    return message.join("\n");
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return "An unexpected error occurred";
}

export function handleApiError(error: unknown): string {
  let message = "An unexpected error occurred";

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (error.response) {
      message = getErrorMessage(error.response.data);
    } else if (error.code === "ECONNABORTED") {
      message = "Request timeout. Please try again.";
    } else if (error.code === "ERR_NETWORK") {
      message = "Network error. Server is unreachable.";
    } else if (error.request) {
      message = "No response received from the server.";
    } else if (error.message) {
      message = error.message;
    }
  } else if (error instanceof Error && error.message) {
    message = error.message;
  }

  toastDisplay(message);
  return message;
}
