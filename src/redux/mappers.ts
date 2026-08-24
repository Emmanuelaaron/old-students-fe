import type { AnnualSubscription, Contribution, Gender, Member, NextOfKin, RoleHistory } from "./types";

export function mapRoleHistory(raw: Record<string, unknown>): RoleHistory {
  const mapPerson = (p: unknown) => {
    if (!p || typeof p !== "object") return { id: "", fullName: "" };
    const r = p as Record<string, unknown>;
    return {
      id: String(r.id),
      fullName: String(r.fullName ?? r.full_name ?? ""),
    };
  };
  return {
    id: String(raw.id),
    memberId: String(raw.memberId ?? raw.member_id ?? ""),
    role: String(raw.role ?? "member") as RoleHistory["role"],
    startedAt: String(raw.startedAt ?? raw.started_at ?? ""),
    endedAt: (raw.endedAt ?? raw.ended_at) ? String(raw.endedAt ?? raw.ended_at) : null,
    appointedBy: mapPerson(raw.appointedBy ?? raw.appointed_by),
    member: mapPerson(raw.member),
  };
}

export function mapAnnualSubscription(raw: Record<string, unknown>): AnnualSubscription {
  const status = String(raw.status ?? "approved");
  return {
    id: String(raw.id),
    memberId: String(raw.memberId ?? raw.member_id ?? ""),
    year: Number(raw.year ?? 0),
    amount: Number(raw.amount ?? 0),
    paidAt: String(raw.paidAt ?? raw.paid_at ?? ""),
    status: (status === "pending" || status === "rejected" ? status : "approved") as AnnualSubscription["status"],
  };
}

export function mapNextOfKin(raw: Record<string, unknown>): NextOfKin {
  return {
    id: String(raw.id),
    memberId: String(raw.memberId ?? raw.member_id ?? ""),
    name: String(raw.name ?? ""),
    telephone: String(raw.telephone ?? raw.tel ?? ""),
    email: String(raw.email ?? ""),
    relationship: String(raw.relationship ?? ""),
  };
}

export function mapMember(raw: Record<string, unknown>): Member {
  const noks = raw.nextOfKins ?? raw.next_of_kins;
  const role = String(raw.role ?? "member") as Member["role"];
  const isChairperson = role === "chairperson" || Boolean(raw.isChairperson ?? raw.isAdmin ?? raw.admin);
  return {
    id: String(raw.id),
    firstName: String(raw.firstName ?? raw.first_name ?? ""),
    lastName: String(raw.lastName ?? raw.last_name ?? ""),
    occupation: String(raw.occupation ?? ""),
    dateOfBirth: String(raw.dateOfBirth ?? raw.date_of_birth ?? "").slice(0, 10),
    tel: String(raw.tel ?? ""),
    address: String(raw.address ?? ""),
    gender: (raw.gender as Gender) || "Other",
    email: String(raw.email ?? ""),
    approved: Boolean(raw.approved),
    role,
    isAdmin: isChairperson,
    isChairperson,
    joinedAt: String(raw.joinedAt ?? raw.joined_at ?? ""),
    nextOfKins: Array.isArray(noks)
      ? noks.map(n => mapNextOfKin(n as Record<string, unknown>))
      : [],
  };
}

export function mapContribution(raw: Record<string, unknown>): Contribution {
  const status = String(raw.status ?? "approved");
  return {
    id: String(raw.id),
    memberId: String(raw.memberId ?? raw.member_id ?? ""),
    month: String(raw.month ?? ""),
    amount: Number(raw.amount ?? 0),
    paidAt: String(raw.paidAt ?? raw.paid_at ?? ""),
    hasFine: Boolean(raw.hasFine ?? raw.has_fine),
    fineAmount: Number(raw.fineAmount ?? raw.fine_amount ?? 0),
    finePaid: Boolean(raw.finePaid ?? raw.fine_paid),
    status: (status === "pending" || status === "rejected" ? status : "approved") as Contribution["status"],
    hasProof: Boolean(raw.hasProof ?? raw.has_proof),
    proofUrl: raw.proofUrl ? String(raw.proofUrl) : raw.proof_url ? String(raw.proof_url) : null,
  };
}
