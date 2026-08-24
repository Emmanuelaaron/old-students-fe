import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function DetailField({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          mb: 0.5,
        }}
      >
        {icon}
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}
