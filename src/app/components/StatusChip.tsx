import { Chip } from "@mui/material";
import type { ReactNode } from "react";

type Variant = "success" | "warning" | "danger" | "neutral" | "navy";

const colors: Record<Variant, { bg: string; color: string }> = {
  success: { bg: "#dcfce7", color: "#15803d" },
  warning: { bg: "#fef3c7", color: "#b45309" },
  danger: { bg: "#fee2e2", color: "#dc2626" },
  neutral: { bg: "#f3f4f6", color: "#6b7280" },
  navy: { bg: "#1b2d5e", color: "#ffffff" },
};

export function StatusChip({
  variant,
  label,
  icon,
}: {
  variant: Variant;
  label: ReactNode;
  icon?: ReactNode;
}) {
  const c = colors[variant];
  return (
    <Chip
      size="small"
      icon={icon as React.ReactElement | undefined}
      label={label}
      sx={{
        bgcolor: c.bg,
        color: c.color,
        fontWeight: 700,
        fontSize: 11,
        height: 24,
        "& .MuiChip-icon": { color: c.color },
      }}
    />
  );
}
