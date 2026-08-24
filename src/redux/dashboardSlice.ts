import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "./apiClient";
import { mapMember } from "./mappers";
import type { Member } from "./types";
import { logout } from "./authSlice";

export type AdminDashboardData = {
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
};

export const fetchAdminDashboard = createAsyncThunk(
  "dashboard/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiRequest<{
        totalMembers: number;
        pendingApprovals: number;
        pendingContributionReports: number;
        collectedThisMonth: number;
        outstandingFines: number;
        notPaidThisMonth: Record<string, unknown>[];
        month: string;
        currentYear: number;
        annualSubscriptionAmount: number;
        paidAnnualSubscriptions: number;
        unpaidAnnualSubscribers: number;
        collectedAnnualSubscriptions: number;
      }>("/dashboard");

      return {
        totalMembers: data.totalMembers,
        pendingApprovals: data.pendingApprovals,
        pendingContributionReports: data.pendingContributionReports ?? 0,
        collectedThisMonth: data.collectedThisMonth,
        outstandingFines: data.outstandingFines,
        notPaidThisMonth: (data.notPaidThisMonth || []).map(mapMember),
        month: data.month,
        currentYear: data.currentYear,
        annualSubscriptionAmount: data.annualSubscriptionAmount,
        paidAnnualSubscriptions: data.paidAnnualSubscriptions,
        unpaidAnnualSubscribers: data.unpaidAnnualSubscribers,
        collectedAnnualSubscriptions: data.collectedAnnualSubscriptions,
      } satisfies AdminDashboardData;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to load dashboard");
    }
  }
);

type DashboardState = {
  admin: AdminDashboardData | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    admin: null,
    status: "idle",
    error: null,
  } as DashboardState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAdminDashboard.pending, state => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.admin = action.payload;
        state.status = "ready";
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) || "Failed to load dashboard";
      })
      .addCase(logout.fulfilled, state => {
        state.admin = null;
        state.status = "idle";
        state.error = null;
      });
  },
});

export default dashboardSlice.reducer;
