import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import annualSubscriptionsReducer from "./annualSubscriptionsSlice";
import authReducer from "./authSlice";
import contributionsReducer from "./contributionsSlice";
import dashboardReducer from "./dashboardSlice";
import membersReducer from "./membersSlice";
import roleHistoryReducer from "./roleHistorySlice";
import statsReducer from "./statsSlice";
import type { RootState as AppRootState } from "./storeTypes";

export const store = configureStore({
  reducer: {
    members: membersReducer,
    contributions: contributionsReducer,
    auth: authReducer,
    stats: statsReducer,
    dashboard: dashboardReducer,
    annualSubscriptions: annualSubscriptionsReducer,
    roleHistory: roleHistoryReducer,
  },
});

export type RootState = AppRootState;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type {
  Gender,
  Member,
  Contribution,
  RegisterInput,
  NextOfKin,
  NextOfKinInput,
  ProfileUpdateInput,
} from "./types";
export { CONTRIBUTION, FINE_AMT, RELATIONSHIP_OPTIONS, MEMBER_ROLES } from "./types";
export { isLate, isPastDue, getMonthsFrom } from "./utils";

export {
  register,
  logout,
  bootstrapAuth,
  clearAuthError,
  updateProfile,
  addNextOfKin,
  updateNextOfKin,
  removeNextOfKin,
  requestOtp,
  verifyOtp,
} from "./authSlice";
export {
  fetchApprovedMembers,
  fetchPendingMembers,
  approveMember,
  rejectMember,
  assignMemberRole,
} from "./membersSlice";
export {
  fetchContributions,
  fetchMyContributions,
  fetchUnpaidFines,
  fetchPendingReports,
  recordContribution,
  reportContribution,
  approveContributionReport,
  rejectContributionReport,
  markFinePaid,
} from "./contributionsSlice";
export { fetchStats } from "./statsSlice";
export { fetchAdminDashboard } from "./dashboardSlice";
export {
  fetchMyAnnualSubscriptions,
  fetchAnnualSubscriptions,
  recordAnnualSubscription,
} from "./annualSubscriptionsSlice";
export { fetchRoleHistory } from "./roleHistorySlice";
export { bootstrapApp, loadDashboardData } from "./thunks";

export type { AnnualSubscription, RoleHistory } from "./types";

export {
  selectMembers,
  selectPendingMembers,
  selectContributions,
  selectApprovedContributions,
  selectUnpaidFines,
  selectPendingReports,
  selectCurrentUser,
  selectAuthStatus,
  selectApprovedMembers,
  selectApprovedCount,
  selectMonthlyContribution,
  selectFineAmount,
  selectAnnualSubscriptionAmount,
  selectAnnualSubscriptions,
  selectRoleHistory,
  selectRoleHistoryStatus,
  selectAdminDashboard,
  selectAdminDashboardStatus,
} from "./selectors";
