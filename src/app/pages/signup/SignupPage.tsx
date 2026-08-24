import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { LogoMark } from "@/app/components/LogoMark";
import type { Gender, RegisterInput } from "@/redux";
import { RELATIONSHIP_OPTIONS } from "@/redux";
import { registerSchema } from "@/app/validation/schemas";
import { AppDatePicker } from "@/app/components/AppDatePicker";

const emptyNextOfKin = {
  name: "",
  telephone: "",
  email: "",
  relationship: "",
};

export function SignupPage({
  onRegister,
  onGoLogin,
}: {
  onRegister: (data: RegisterInput) => Promise<string | null>;
  onGoLogin: () => void;
}) {
  const [serverError, setServerError] = useState("");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 5, px: 2 }}>
      <Paper elevation={3} sx={{ maxWidth: 720, mx: "auto", overflow: "hidden" }}>
        <Box sx={{ bgcolor: "primary.main", color: "common.white", textAlign: "center", px: 3, py: 3.5 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <LogoMark size={56} />
          </Box>
          <Typography variant="h5">Member Registration</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)" }}>
            Complete your bio to join the association — no password needed
          </Typography>
        </Box>

        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            occupation: "",
            dateOfBirth: "",
            tel: "",
            address: "",
            gender: "Male" as Gender,
            email: "",
            nextOfKins: [emptyNextOfKin],
          }}
          validationSchema={registerSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setServerError("");
            const err = await onRegister(values as RegisterInput);
            setSubmitting(false);
            if (err) setServerError(err);
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => {
            const nok = values.nextOfKins[0];
            const nokError = errors.nextOfKins?.[0];
            const nokTouched = touched.nextOfKins?.[0];

            return (
              <Box component={Form} sx={{ p: { xs: 3, sm: 4 } }}>
                <Alert severity="info" sx={{ mb: 2.5 }}>
                  After you register you will receive a welcome email. A chairperson must approve your
                  membership before you can use the system.
                </Alert>

                <Box
                  sx={{
                    display: "grid",
                    gap: 2.5,
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  }}
                >
                  <TextField
                    name="firstName"
                    label="First Name"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
                    fullWidth
                  />
                  <TextField
                    name="lastName"
                    label="Last Name"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.lastName && Boolean(errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
                    fullWidth
                  />
                  <TextField
                    name="occupation"
                    label="Occupation"
                    value={values.occupation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.occupation && Boolean(errors.occupation)}
                    helperText={touched.occupation && errors.occupation}
                    fullWidth
                  />
                  <AppDatePicker
                    name="dateOfBirth"
                    label="Date of Birth"
                    value={values.dateOfBirth}
                    onChange={iso => setFieldValue("dateOfBirth", iso)}
                    onBlur={handleBlur}
                    error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
                    helperText={touched.dateOfBirth && errors.dateOfBirth}
                    disableFuture
                  />
                  <TextField
                    name="tel"
                    label="Tel. Contact"
                    value={values.tel}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.tel && Boolean(errors.tel)}
                    helperText={touched.tel && errors.tel}
                    fullWidth
                  />
                  <TextField
                    name="email"
                    label="Email Address"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    fullWidth
                  />
                </Box>

                <TextField
                  name="address"
                  label="Residential Address"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{ mt: 2.5 }}
                />

                <FormControl sx={{ mt: 2.5 }} error={touched.gender && Boolean(errors.gender)}>
                  <FormLabel>Gender</FormLabel>
                  <RadioGroup
                    row
                    name="gender"
                    value={values.gender}
                    onChange={e => setFieldValue("gender", e.target.value as Gender)}
                    onBlur={handleBlur}
                  >
                    {(["Male", "Female"] as Gender[]).map(g => (
                      <FormControlLabel key={g} value={g} control={<Radio color="secondary" />} label={g} />
                    ))}
                  </RadioGroup>
                  {touched.gender && errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                </FormControl>

                <Box sx={{ mt: 3, p: 2.5, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="h6" gutterBottom>
                    Next of Kin Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Provide at least one person we can contact in case of an emergency.
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gap: 2.5,
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    }}
                  >
                    <TextField
                      name="nextOfKins[0].name"
                      label="Full Name"
                      value={nok.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(nokTouched?.name && nokError?.name)}
                      helperText={nokTouched?.name && nokError?.name}
                      fullWidth
                    />
                    <TextField
                      name="nextOfKins[0].telephone"
                      label="Telephone"
                      value={nok.telephone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(nokTouched?.telephone && nokError?.telephone)}
                      helperText={nokTouched?.telephone && nokError?.telephone}
                      fullWidth
                    />
                    <TextField
                      name="nextOfKins[0].email"
                      label="Email"
                      type="email"
                      value={nok.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(nokTouched?.email && nokError?.email)}
                      helperText={nokTouched?.email && nokError?.email}
                      fullWidth
                    />
                    <FormControl
                      fullWidth
                      error={Boolean(nokTouched?.relationship && nokError?.relationship)}
                    >
                      <InputLabel>Relationship</InputLabel>
                      <Select
                        name="nextOfKins[0].relationship"
                        value={nok.relationship}
                        label="Relationship"
                        onChange={e =>
                          setFieldValue("nextOfKins[0].relationship", e.target.value)
                        }
                        onBlur={handleBlur}
                      >
                        {RELATIONSHIP_OPTIONS.map(r => (
                          <MenuItem key={r} value={r}>
                            {r}
                          </MenuItem>
                        ))}
                      </Select>
                      {nokTouched?.relationship && nokError?.relationship && (
                        <FormHelperText>{nokError.relationship}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                </Box>

                {serverError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {serverError}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ mt: 3 }}
                >
                  {isSubmitting ? "Submitting…" : "Submit Registration"}
                </Button>

                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                  Already registered?{" "}
                  <Link component="button" type="button" onClick={onGoLogin} underline="hover" color="secondary">
                    Login here
                  </Link>
                </Typography>
              </Box>
            );
          }}
        </Formik>
      </Paper>
    </Box>
  );
}
