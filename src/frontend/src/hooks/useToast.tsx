import { toast as sonnerToast } from "sonner";

export function useToast() {
  const success = (message: string) => {
    sonnerToast.success(message, { duration: 4000 });
  };

  const error = (message: string) => {
    sonnerToast.error(message, { duration: 5000 });
  };

  const info = (message: string) => {
    sonnerToast.info(message, { duration: 4000 });
  };

  return { success, error, info };
}
