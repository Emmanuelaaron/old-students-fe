import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { LogoMark } from "@/app/components/LogoMark";
import { loginIdentifierSchema, otpSchema } from "@/app/validation/schemas";

function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value?: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const otp = value ?? "";
  const digits = Array.from({ length: 6 }, (_, i) => otp[i] ?? "");

  const focusAt = (index: number) => {
    const el = document.getElementById(`otp-digit-${index}`) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  };

  return (
    <Stack direction="row" spacing={1} justifyContent="center">
      {digits.map((digit, index) => (
        <TextField
          key={index}
          id={`otp-digit-${index}`}
          value={digit}
          disabled={disabled}
          onChange={e => {
            const raw = e.target.value.replace(/\D/g, "");
            if (!raw) {
              const next = `${otp.slice(0, index)}${otp.slice(index + 1)}`;
              onChange(next);
              return;
            }
            const chars = raw.slice(0, 6 - index).split("");
            const next = `${otp.slice(0, index)}${chars.join("")}${otp.slice(index + chars.length)}`.slice(0, 6);
            onChange(next);
            focusAt(Math.min(index + chars.length, 5));
          }}
          onKeyDown={e => {
            if (e.key === "Backspace" && !digits[index] && index > 0) {
              onChange(otp.slice(0, index - 1));
              focusAt(index - 1);
            }
          }}
          onPaste={e => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (pasted) {
              onChange(pasted);
              focusAt(Math.min(pasted.length, 5));
            }
          }}
          inputProps={{
            inputMode: "numeric",
            autoComplete: index === 0 ? "one-time-code" : "off",
            maxLength: 1,
            "aria-label": `OTP digit ${index + 1}`,
            style: { textAlign: "center", fontSize: 22, fontWeight: 700, padding: "12px 0" },
          }}
          sx={{ width: 48, "& .MuiInputBase-root": { height: 56 } }}
        />
      ))}
    </Stack>
  );
}

export function LoginPage({
  onRequestOtp,
  onVerifyOtp,
  onGoRegister,
}: {
  onRequestOtp: (identifier: string) => Promise<{ error?: string; emailHint?: string }>;
  onVerifyOtp: (identifier: string, code: string) => Promise<string | null>;
  onGoRegister: () => void;
}) {
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [info, setInfo] = useState("");
  const [serverError, setServerError] = useState("");

  const sendCode = async (id: string) => {
    setServerError("");
    const result = await onRequestOtp(id);
    if (result.error) {
      setServerError(result.error);
      return false;
    }
    setIdentifier(id);
    setEmailHint(result.emailHint || "");
    setInfo(
      result.emailHint
        ? `Enter the OTP sent to ${result.emailHint}.`
        : "Enter the OTP sent to your email."
    );
    setStep("otp");
    return true;
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "grid", placeItems: "center", p: 2 }}>
      <Paper elevation={3} sx={{ width: "100%", maxWidth: 420, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "primary.main", color: "common.white", textAlign: "center", px: 3, pt: 4, pb: 3.5 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <LogoMark size={64} />
          </Box>
          <Typography variant="h5">Member Login</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
            HCLV Old Students&apos; Association
          </Typography>
        </Box>

        {step === "identifier" ? (
          <Formik
            initialValues={{ identifier }}
            validationSchema={loginIdentifierSchema}
            onSubmit={async (values, { setSubmitting }) => {
              await sendCode(values.identifier.trim());
              setSubmitting(false);
            }}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form>
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Enter your email or phone number. We will email you a one-time password (OTP).
                  </Typography>
                  <TextField
                    name="identifier"
                    label="Email or phone number"
                    value={values.identifier ?? ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.identifier && Boolean(errors.identifier)}
                    helperText={touched.identifier && errors.identifier}
                    autoFocus
                    fullWidth
                  />
                  {serverError && <Alert severity="error">{serverError}</Alert>}
                  <Button type="submit" variant="contained" color="secondary" size="large" disabled={isSubmitting}>
                    {isSubmitting ? "Sending OTP…" : "Send OTP"}
                  </Button>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Not a member?{" "}
                    <Link component="button" type="button" onClick={onGoRegister} underline="hover" color="secondary">
                      Register
                    </Link>
                  </Typography>
                </Stack>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ code: "" }}
            validationSchema={otpSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setServerError("");
              const err = await onVerifyOtp(identifier, (values.code ?? "").trim());
              setSubmitting(false);
              if (err) setServerError(err);
            }}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue, submitForm }) => {
              const code = values.code ?? "";
              return (
              <Form>
                <Stack spacing={2.5} sx={{ p: 3 }}>
                  {info && <Alert severity="success">{info}</Alert>}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }} textAlign="center">
                      Enter OTP
                    </Typography>
                    <OtpBoxes
                      value={code}
                      disabled={isSubmitting}
                      onChange={next => {
                        setFieldValue("code", next ?? "", true);
                        if ((next ?? "").length === 6) setTimeout(() => void submitForm(), 0);
                      }}
                    />
                    {touched.code && errors.code && (
                      <Typography variant="caption" color="error" display="block" textAlign="center" sx={{ mt: 1 }}>
                        {errors.code}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 1 }}>
                      6-digit code from your email
                    </Typography>
                  </Box>
                  {serverError && <Alert severity="error">{serverError}</Alert>}
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    size="large"
                    disabled={isSubmitting || code.length !== 6}
                    onClick={() => void submitForm()}
                  >
                    {isSubmitting ? "Verifying…" : "Verify OTP & login"}
                  </Button>
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setStep("identifier");
                      setServerError("");
                      setInfo("");
                    }}
                  >
                    Use a different email or phone
                  </Button>
                  <Button type="button" disabled={isSubmitting} onClick={() => void sendCode(identifier)}>
                    Resend OTP
                  </Button>
                </Stack>
              </Form>
              );
            }}
          </Formik>
        )}
      </Paper>
    </Box>
  );
}
