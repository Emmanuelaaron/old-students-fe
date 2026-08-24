import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./storeTypes";

export const selectMembers = (state: RootState) => state.members.items;
export const selectPendingMembers = (state: RootState) => state.members.pending;
export const selectContributions = (state: RootState) => state.contributions.items;
export const selectUnpaidFines = (state: RootState) => state.contributions.unpaidFines;
export const selectPendingReports = (state: RootState) => state.contributions.pendingReports;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectApprovedCount = (state: RootState) => state.stats.approvedCount;
export const selectMonthlyContribution = (state: RootState) => state.stats.monthlyContribution;
export const selectFineAmount = (state: RootState) => state.stats.fineAmount;
export const selectAnnualSubscriptionAmount = (state: RootState) => state.stats.annualSubscriptionAmount;
export const selectAnnualSubscriptions = (state: RootState) => state.annualSubscriptions.items;
export const selectAnnualSubscriptionsStatus = (state: RootState) => state.annualSubscriptions.status;
export const selectRoleHistory = (state: RootState) => state.roleHistory.items;
export const selectRoleHistoryStatus = (state: RootState) => state.roleHistory.status;
export const selectAdminDashboard = (state: RootState) => state.dashboard.admin;
export const selectAdminDashboardStatus = (state: RootState) => state.dashboard.status;

export const selectApprovedMembers = createSelector([selectMembers], members =>
  members.filter(m => m.approved)
);

export const selectApprovedContributions = createSelector([selectContributions], items =>
  items.filter(c => c.status === "approved")
);
