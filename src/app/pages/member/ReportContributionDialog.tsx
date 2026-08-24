import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Form, Formik } from "formik";
import {
  getMonthsFrom,
  isLate,
  isPastDue,
  selectFineAmount,
  selectMonthlyContribution,
  useAppSelector,
  type Contribution,
  type Member,
} from "@/redux";
import { fmtMonth, fmtUGX, todayISO } from "@/app/utils/format";
import { reportContributionSchema } from "@/app/validation/schemas";
import { AppDatePicker } from "@/app/components/AppDatePicker";

export function ReportContributionDialog({
  open,
  onClose,
  onSubmit,
  user,
  contributions,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (months: string[], paidAt: string, proof: File) => Promise<string | null>;
  user: Member;
  contributions: Contribution[];
}) {
  const monthlyContribution = useAppSelector(selectMonthlyContribution);
  const fineAmount = useAppSelector(selectFineAmount);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");

  const availableMonths = useMemo(() => {
    const taken = new Set(
      contributions
        .filter(c => c.memberId === user.id && (c.status === "approved" || c.status === "pending"))
        .map(c => c.month)
    );
    return getMonthsFrom(user.joinedAt).filter(m => !taken.has(m) && isPastDue(m));
  }, [contributions, user.id, user.joinedAt]);

  useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
      setServerError("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Formik
        enableReinitialize
        initialValues={{
          months: availableMonths[0] ? [availableMonths[0]] : ([] as string[]),
          paidAt: todayISO(),
          proof: null as File | null,
        }}
        validationSchema={reportContributionSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setServerError("");
          const err = await onSubmit(values.months, values.paidAt, values.proof as File);
          setSubmitting(false);
          if (err) {
            setServerError(err);
            return;
          }
          onClose();
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue, setFieldTouched }) => {
          const lateCount = values.months.filter(m => values.paidAt && isLate(m, values.paidAt)).length;
          const totalAmount = values.months.length * monthlyContribution;
          const totalFines = lateCount * fineAmount;

          return (
            <Form>
              <DialogTitle>Report Contribution</DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select one or more months, attach a payment proof image, and submit for admin approval.
                </Typography>
                <Stack spacing={2}>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={availableMonths}
                    value={values.months}
                    onChange={(_, value) => {
                      const valid: string[] = [];
                      for (const m of availableMonths) {
                        if (value.includes(m)) valid.push(m);
                        else break;
                      }
                      setFieldValue("months", valid);
                    }}
                    onBlur={() => setFieldTouched("months", true)}
                    getOptionLabel={opt => fmtMonth(opt)}
                    getOptionDisabled={option => {
                      const idx = availableMonths.indexOf(option);
                      return idx > 0 && !values.months.includes(availableMonths[idx - 1]);
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option}>
                        <Checkbox checked={selected} sx={{ mr: 1 }} />
                        {fmtMonth(option)}
                        {values.paidAt && isLate(option, values.paidAt) ? " · late fine" : ""}
                      </li>
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip {...getTagProps({ index })} key={option} label={fmtMonth(option)} size="small" />
                      ))
                    }
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="Months paying for"
                        placeholder={availableMonths.length ? "Select months" : "No overdue months"}
                        error={touched.months && Boolean(errors.months)}
                        helperText={
                          (touched.months && (errors.months as string)) ||
                          (availableMonths.length
                            ? "Pay the oldest overdue month first"
                            : "No overdue months to pay")
                        }
                      />
                    )}
                    disabled={!availableMonths.length}
                  />

                  <AppDatePicker
                    name="paidAt"
                    label="Payment Date"
                    value={values.paidAt}
                    onChange={iso => setFieldValue("paidAt", iso)}
                    onBlur={handleBlur}
                    error={touched.paidAt && Boolean(errors.paidAt)}
                    helperText={touched.paidAt && errors.paidAt}
                  />

                  <Box>
                    <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth>
                      {values.proof ? "Change proof image" : "Attach proof of payment"}
                      <input
                        hidden
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={e => {
                          const file = e.target.files?.[0] ?? null;
                          setFieldTouched("proof", true);
                          setFieldValue("proof", file);
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(file ? URL.createObjectURL(file) : null);
                        }}
                      />
                    </Button>
                    {values.proof && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        {values.proof.name} · {(values.proof.size / 1024).toFixed(0)} KB
                      </Typography>
                    )}
                    {touched.proof && errors.proof && (
                      <FormHelperText error>{errors.proof as string}</FormHelperText>
                    )}
                    {previewUrl && (
                      <Box
                        component="img"
                        src={previewUrl}
                        alt="Proof preview"
                        sx={{
                          mt: 1.5,
                          maxWidth: "100%",
                          maxHeight: 220,
                          borderRadius: 1,
                          border: 1,
                          borderColor: "divider",
                          objectFit: "contain",
                          bgcolor: "background.default",
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ bgcolor: "background.default", borderRadius: 2, p: 2 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Months selected
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>
                        {values.months.length}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Contribution total
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>
                        {fmtUGX(totalAmount)}
                      </Typography>
                    </Stack>
                    {lateCount > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                        <Typography variant="caption" color="warning.main" fontWeight={700}>
                          Late fines ({lateCount} × 10%)
                        </Typography>
                        <Typography variant="caption" color="warning.main" fontWeight={700}>
                          {fmtUGX(totalFines)}
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                  {serverError && <Alert severity="error">{serverError}</Alert>}
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={isSubmitting || !availableMonths.length}
                >
                  {isSubmitting ? "Submitting…" : "Submit for Approval"}
                </Button>
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
}
