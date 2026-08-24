import * as yup from "yup";

const phonePattern = /^(\+?\d[\d\s-]{7,16}|\d{9,15})$/;

export const isEmailOrPhone = (value: string) => {
  const v = value.trim();
  if (!v) return false;
  if (v.includes("@")) return yup.string().email().isValidSync(v);
  return phonePattern.test(v);
};

export const loginIdentifierSchema = yup.object({
  identifier: yup
    .string()
    .default("")
    .trim()
    .required("Enter your email or phone number")
    .test("email-or-phone", "Enter a valid email or phone number", value =>
      isEmailOrPhone(value ?? "")
    ),
});

export const otpSchema = yup.object({
  code: yup
    .string()
    .default("")
    .required("Enter the code from your email")
    .matches(/^\d{6}$/, "Enter the 6-digit code"),
});

export const nextOfKinSchema = yup.object({
  name: yup.string().trim().required("Full name is required"),
  telephone: yup
    .string()
    .trim()
    .required("Telephone is required")
    .test("phone", "Enter a valid phone number", value => phonePattern.test((value ?? "").trim())),
  email: yup.string().trim().required("Email is required").email("Enter a valid email address"),
  relationship: yup.string().trim().required("Select a relationship"),
});

export const registerSchema = yup.object({
  firstName: yup.string().trim().required("First name is required").min(2, "Enter at least 2 characters"),
  lastName: yup.string().trim().required("Last name is required").min(2, "Enter at least 2 characters"),
  occupation: yup.string().trim().required("Occupation is required"),
  dateOfBirth: yup
    .string()
    .required("Date of birth is required")
    .test("past", "Date of birth must be in the past", value => {
      if (!value) return false;
      const d = new Date(value);
      return !Number.isNaN(d.getTime()) && d < new Date();
    }),
  tel: yup
    .string()
    .trim()
    .required("Telephone is required")
    .test("phone", "Enter a valid phone number", value => phonePattern.test((value ?? "").trim())),
  email: yup.string().trim().required("Email is required").email("Enter a valid email address"),
  address: yup.string().trim().required("Residential address is required").min(5, "Enter a fuller address"),
  gender: yup.mixed<"Male" | "Female">().oneOf(["Male", "Female"]).required(),
  nextOfKins: yup.array().of(nextOfKinSchema).min(1, "At least one next of kin is required"),
});

export const profileSchema = registerSchema.omit(["nextOfKins"]);

export const reportContributionSchema = yup.object({
  months: yup.array().of(yup.string().required()).min(1, "Select at least one month"),
  paidAt: yup.string().required("Payment date is required"),
  proof: yup
    .mixed<File>()
    .required("Attach an image as proof of payment")
    .test("fileType", "Proof of payment must be an image", value =>
      value instanceof File ? value.type.startsWith("image/") : false
    )
    .test("fileSize", "Proof image must be 5 MB or smaller", value =>
      value instanceof File ? value.size <= 5 * 1024 * 1024 : false
    ),
});

export const recordContributionSchema = yup.object({
  memberId: yup.string().required("Please select a member"),
  month: yup.string().required("Month is required"),
  paidAt: yup.string().required("Payment date is required"),
});
