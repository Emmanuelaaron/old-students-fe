import type { AnnualSubscription, Contribution, Member, RoleHistory } from "./types";

export interface AdminDashboardData {
  totalMembers: number;
  pendingApprovals: number;
  pendingContributionReports: number;
  collectedThisMonth: number;
  outstandingFines: number;
  notPaidThisMonth: Member[];
  month: string;
  currentYear: number;
  annualSubscriptionAmount: number;
  paidAnnualSubscriptions: number;
  unpaidAnnualSubscribers: number;
  collectedAnnualSubscriptions: number;
}

export interface RootState {
  members: {
    items: Member[];
    pending: Member[];
    status: string;
    error: string | null;
  };
  contributions: {
    items: Contribution[];
    unpaidFines: Contribution[];
    pendingReports: Contribution[];
    status: string;
  };
  auth: {
    user: Member | null;
    relationships: string[];
    status: string;
    error: string | null;
  };
  stats: {
    approvedCount: number;
    monthlyContribution: number;
    fineAmount: number;
    annualSubscriptionAmount: number;
    status: string;
  };
  dashboard: {
    admin: AdminDashboardData | null;
    status: string;
    error: string | null;
  };
  annualSubscriptions: {
    items: AnnualSubscription[];
    status: string;
  };
  roleHistory: {
    items: RoleHistory[];
    status: string;
  };
}

export type AppDispatch = import("@reduxjs/toolkit").ThunkDispatch<
  RootState,
  unknown,
  import("@reduxjs/toolkit").UnknownAction
>;
