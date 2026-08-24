export type Gender = "Male" | "Female" | "Other";

export interface NextOfKin {
  id: string;
  memberId: string;
  name: string;
  telephone: string;
  email: string;
  relationship: string;
}

export const MEMBER_ROLES = [
  "member",
  "chairperson",
  "vice_chairperson",
  "secretary",
  "vice_secretary",
  "treasurer",
  "vice_treasurer",
] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  occupation: string;
  dateOfBirth: string;
  tel: string;
  address: string;
  gender: Gender;
  email: string;
  approved: boolean;
  role: MemberRole;
  isAdmin: boolean;
  isChairperson: boolean;
  joinedAt: string;
  nextOfKins?: NextOfKin[];
}

export interface Contribution {
  id: string;
  memberId: string;
  month: string; // YYYY-MM
  amount: number;
  paidAt: string;
  hasFine: boolean;
  fineAmount: number;
  finePaid: boolean;
  status: "pending" | "approved" | "rejected";
  hasProof?: boolean;
  proofUrl?: string | null;
}

export type RegisterInput = {
  firstName: string;
  lastName: string;
  occupation: string;
  dateOfBirth: string;
  tel: string;
  address: string;
  gender: Gender;
  email: string;
  nextOfKins: NextOfKinInput[];
};

export type ProfileUpdateInput = {
  firstName: string;
  lastName: string;
  occupation: string;
  dateOfBirth: string;
  tel: string;
  address: string;
  gender: Gender;
  email: string;
};

export type NextOfKinInput = {
  name: string;
  telephone: string;
  email: string;
  relationship: string;
};

export interface RoleHistory {
  id: string;
  memberId: string;
  role: MemberRole;
  startedAt: string;
  endedAt: string | null;
  appointedBy?: { id: string; fullName: string };
  member?: { id: string; fullName: string };
}

export interface AnnualSubscription {
  id: string;
  memberId: string;
  year: number;
  amount: number;
  paidAt: string;
  status: "pending" | "approved" | "rejected";
}

export const RELATIONSHIP_OPTIONS = [
  "Parent",
  "Father",
  "Mother",
  "Sibling",
  "Brother",
  "Sister",
  "Child",
  "Son",
  "Daughter",
  "Guardian",
  "Grandparent",
  "Aunt",
  "Uncle",
  "Cousin",
  "Friend",
  "In-law",
  "Other",
] as const;

/** Defaults; overwritten from GET /api/v1/stats when available */
export const CONTRIBUTION = 100_000;
export const FINE_AMT = CONTRIBUTION * 0.1; // 10,000 UGX

export const STORAGE_KEYS = {
  token: "hclv_api_token",
} as const;
