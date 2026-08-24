import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "./storeTypes";
import {
  fetchAnnualSubscriptions,
  fetchMyAnnualSubscriptions,
} from "./annualSubscriptionsSlice";
import { bootstrapAuth } from "./authSlice";
import { fetchApprovedMembers, fetchPendingMembers } from "./membersSlice";
import {
  fetchContributions,
  fetchMyContributions,
  fetchPendingReports,
  fetchUnpaidFines,
} from "./contributionsSlice";
import { fetchAdminDashboard } from "./dashboardSlice";
import { fetchStats } from "./statsSlice";

export const loadDashboardData = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>("app/loadDashboardData", async (_, { getState, dispatch }) => {
  const user = getState().auth.user;
  if (!user) return;

  if (user.isAdmin) {
    await Promise.all([
      dispatch(fetchApprovedMembers()),
      dispatch(fetchPendingMembers()),
      dispatch(fetchContributions()),
      dispatch(fetchUnpaidFines()),
      dispatch(fetchPendingReports()),
      dispatch(fetchAdminDashboard()),
      dispatch(fetchAnnualSubscriptions()),
      dispatch(fetchStats()),
    ]);
  } else if (user.approved) {
    await Promise.all([
      dispatch(fetchMyContributions()),
      dispatch(fetchMyAnnualSubscriptions()),
      dispatch(fetchStats()),
    ]);
  }
});

export const bootstrapApp = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>("app/bootstrap", async (_, { dispatch }) => {
  try {
    await dispatch(fetchStats()).unwrap();
  } catch {
    // Backend may be down; UI keeps default amounts
  }

  const result = await dispatch(bootstrapAuth());
  if (bootstrapAuth.fulfilled.match(result) && result.payload) {
    await dispatch(loadDashboardData());
  }
});
