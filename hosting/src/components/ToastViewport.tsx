import { RoleToast } from "@/components/RoleToast";
import { useToast } from "@/context/ToastContext";

export function ToastViewport() {
  const { message, clearToast } = useToast();

  return <RoleToast message={message} onDismiss={clearToast} offset={16} />;
}
