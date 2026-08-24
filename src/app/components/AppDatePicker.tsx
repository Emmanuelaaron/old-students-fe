import type { ReactNode } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, isValid, parse, parseISO } from "date-fns";

function parseValue(value: string, monthOnly: boolean): Date | null {
  if (!value) return null;
  const parsed = monthOnly ? parse(value, "yyyy-MM", new Date()) : parseISO(value.slice(0, 10));
  return isValid(parsed) ? parsed : null;
}

export function AppDatePicker({
  label,
  value,
  onChange,
  onBlur,
  name,
  error,
  helperText,
  disableFuture,
  fullWidth = true,
}: {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  onBlur?: () => void;
  name?: string;
  error?: boolean;
  helperText?: ReactNode;
  disableFuture?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <DatePicker
      label={label}
      value={parseValue(value, false)}
      onChange={date => onChange(date && isValid(date) ? format(date, "yyyy-MM-dd") : "")}
      disableFuture={disableFuture}
      format="dd/MM/yyyy"
      slotProps={{
        textField: {
          name,
          fullWidth,
          error,
          helperText,
          onBlur,
        },
      }}
    />
  );
}

export function AppMonthPicker({
  label,
  value,
  onChange,
  onBlur,
  name,
  error,
  helperText,
  fullWidth = true,
}: {
  label: string;
  value: string;
  onChange: (yearMonth: string) => void;
  onBlur?: () => void;
  name?: string;
  error?: boolean;
  helperText?: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <DatePicker
      label={label}
      views={["year", "month"]}
      openTo="month"
      value={parseValue(value, true)}
      onChange={date => onChange(date && isValid(date) ? format(date, "yyyy-MM") : "")}
      format="MMMM yyyy"
      slotProps={{
        textField: {
          name,
          fullWidth,
          error,
          helperText,
          onBlur,
        },
      }}
    />
  );
}
