import { roleOptions, useRole } from "@/context/RoleContext";
import type { Role } from "@/context/RoleContext";

interface RoleToggleProps {
  tone?: "light" | "dark";
  className?: string;
  onRoleChange?: (role: Role) => void;
}

const toneStyles = {
  light: {
    wrapper: "border-gray-200 bg-white text-gray-600",
    active: "bg-orange-500 text-white shadow",
    inactive: "text-gray-500 hover:text-gray-800",
  },
  dark: {
    wrapper: "border-white/40 bg-white/10 text-white",
    active: "bg-white text-orange-600 shadow",
    inactive: "text-white/80 hover:text-white",
  },
};

export function RoleToggle({ tone = "light", className = "", onRoleChange }: RoleToggleProps) {
  const { role, setRole } = useRole();
  const palette = toneStyles[tone];

  return (
    <div
      className={`flex rounded-full border p-1 text-sm shadow-sm transition ${palette.wrapper} ${className}`.trim()}
    >
      {roleOptions.map((option) => {
        const isActive = role === option.value;
        return (
          <button
            key={option.value}
            className={`rounded-full px-3 py-1 font-semibold transition ${
              isActive ? palette.active : palette.inactive
            }`}
            onClick={() => {
              setRole(option.value);
              onRoleChange?.(option.value);
            }}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
