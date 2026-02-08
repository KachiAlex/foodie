import { RoleToast } from "@/components/RoleToast";
import { useToast } from "@/context/ToastContext";
import { useRole } from "@/context/RoleContext";

export function ToastViewport() {
  const { message, clearToast } = useToast();
  const { toastMessage, clearToast: clearRoleToast } = useRole();

  return (
    <div>
      <RoleToast message={toastMessage} onDismiss={clearRoleToast} offset={16} />
      <RoleToast message={message} onDismiss={clearToast} offset={72} />
    </div>
  );
}
