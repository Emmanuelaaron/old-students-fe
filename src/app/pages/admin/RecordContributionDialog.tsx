import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Form, Formik } from "formik";
import type { Member } from "@/redux";
import { isLate, selectFineAmount, selectMonthlyContribution, useAppSelector } from "@/redux";
import { fmtUGX, nowYM, todayISO } from "@/app/utils/format";
import { recordContributionSchema } from "@/app/validation/schemas";
import { AppDatePicker, AppMonthPicker } from "@/app/components/AppDatePicker";

export function RecordContributionDialog({
  open,
  approved,
  onClose,
  onSubmit,
}: {
  open: boolean;
  approved: Member[];
  onClose: () => void;
  onSubmit: (memberId: string, month: string, paidAt: string) => Promise<string | null>;
}) {
  const monthlyContribution = useAppSelector(selectMonthlyContribution);
  const fineAmount = useAppSelector(selectFineAmount);
  const [serverError, setServerError] = useState("");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <Formik
        enableReinitialize
        initialValues={{ memberId: "", month: nowYM(), paidAt: todayISO() }}
        validationSchema={recordContributionSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setServerError("");
          const err = await onSubmit(values.memberId, values.month, values.paidAt);
          setSubmitting(false);
          if (err) {
            setServerError(err);
            return;
          }
          resetForm();
          onClose();
        }}
      >
        {({ values, errors, touched, handleBlur, isSubmitting, setFieldValue }) => {
          const finePreview = values.month && values.paidAt && isLate(values.month, values.paidAt);
          return (
            <Form>
              <DialogTitle>Record Contribution</DialogTitle>
              <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                  <FormControl fullWidth error={touched.memberId && Boolean(errors.memberId)}>
                    <InputLabel>Member</InputLabel>
                    <Select
                      label="Member"
                      name="memberId"
                      value={values.memberId}
                      onChange={e => setFieldValue("memberId", e.target.value)}
                      onBlur={handleBlur}
                    >
                      {approved.map(m => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.firstName} {m.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.memberId && errors.memberId && <FormHelperText>{errors.memberId}</FormHelperText>}
                  </FormControl>
                  <AppMonthPicker
                    name="month"
                    label="Month"
                    value={values.month}
                    onChange={ym => setFieldValue("month", ym)}
                    onBlur={handleBlur}
                    error={touched.month && Boolean(errors.month)}
                    helperText={touched.month && errors.month}
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
                  <Box sx={{ bgcolor: "background.default", borderRadius: 2, p: 2 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Contribution
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>
                        {fmtUGX(monthlyContribution)}
                      </Typography>
                    </Stack>
                    {finePreview && (
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                        <Typography variant="caption" color="warning.main" fontWeight={700}>
                          Late fine (10%)
                        </Typography>
                        <Typography variant="caption" color="warning.main" fontWeight={700}>
                          {fmtUGX(fineAmount)}
                        </Typography>
                      </Stack>
                    )}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mt: 1, pt: 1, borderTop: "1px solid", borderColor: "divider" }}
                    >
                      <Typography variant="caption" fontWeight={800}>
                        Total
                      </Typography>
                      <Typography variant="caption" fontWeight={800}>
                        {fmtUGX(monthlyContribution + (finePreview ? fineAmount : 0))}
                      </Typography>
                    </Stack>
                  </Box>
                  {serverError && <Alert severity="error">{serverError}</Alert>}
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Record Payment"}
                </Button>
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
}
