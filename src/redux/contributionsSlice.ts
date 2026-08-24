import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFormRequest, apiRequest } from "./apiClient";
import { mapContribution } from "./mappers";
import type { Contribution } from "./types";
import { logout } from "./authSlice";

export const fetchContributions = createAsyncThunk("contributions/fetchAll", async () => {
  const data = await apiRequest<{ contributions: Record<string, unknown>[] }>("/contributions");
  return data.contributions.map(mapContribution);
});

export const fetchMyContributions = createAsyncThunk("contributions/fetchMine", async () => {
  const data = await apiRequest<{ contributions: Record<string, unknown>[] }>("/contributions/mine");
  return data.contributions.map(mapContribution);
});

export const fetchUnpaidFines = createAsyncThunk("contributions/fetchUnpaidFines", async () => {
  const data = await apiRequest<{ contributions: Record<string, unknown>[] }>(
    "/contributions/unpaid_fines"
  );
  return data.contributions.map(mapContribution);
});

export const fetchPendingReports = createAsyncThunk("contributions/fetchPendingReports", async () => {
  const data = await apiRequest<{ contributions: Record<string, unknown>[] }>(
    "/contributions/pending_reports"
  );
  return data.contributions.map(mapContribution);
});

export const recordContribution = createAsyncThunk(
  "contributions/record",
  async (
    payload: { memberId: string; month: string; paidAt: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await apiRequest<{ contribution: Record<string, unknown> }>("/contributions", {
        method: "POST",
        body: {
          member_id: Number(payload.memberId),
          month: payload.month,
          paid_at: payload.paidAt,
        },
      });
      return mapContribution(data.contribution);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Could not record contribution");
    }
  }
);

export const reportContribution = createAsyncThunk(
  "contributions/report",
  async (
    payload: { months: string[]; paidAt: string; proof: File },
    { rejectWithValue }
  ) => {
    try {
      const form = new FormData();
      payload.months.forEach(month => form.append("months[]", month));
      form.append("paid_at", payload.paidAt);
      form.append("proof", payload.proof);

      const data = await apiFormRequest<{ contributions: Record<string, unknown>[] }>(
        "/contributions/report",
        form
      );
      return data.contributions.map(mapContribution);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Could not submit contribution report");
    }
  }
);

export const approveContributionReport = createAsyncThunk(
  "contributions/approveReport",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiRequest<{ contribution: Record<string, unknown> }>(
        `/contributions/${id}/approve_report`,
        { method: "POST" }
      );
      return mapContribution(data.contribution);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Could not approve report");
    }
  }
);

export const rejectContributionReport = createAsyncThunk(
  "contributions/rejectReport",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiRequest(`/contributions/${id}/reject_report`, { method: "POST" });
      return id;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Could not reject report");
    }
  }
);

export const markFinePaid = createAsyncThunk(
  "contributions/markFinePaid",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await apiRequest<{ contribution: Record<string, unknown> }>(
        `/contributions/${id}/mark_fine_paid`,
        { method: "PATCH" }
      );
      return mapContribution(data.contribution);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Could not mark fine paid");
    }
  }
);

type ContributionsState = {
  items: Contribution[];
  unpaidFines: Contribution[];
  pendingReports: Contribution[];
  status: "idle" | "loading" | "ready" | "error";
};

const contributionsSlice = createSlice({
  name: "contributions",
  initialState: {
    items: [] as Contribution[],
    unpaidFines: [] as Contribution[],
    pendingReports: [] as Contribution[],
    status: "idle",
  } as ContributionsState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchContributions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "ready";
      })
      .addCase(fetchMyContributions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "ready";
      })
      .addCase(fetchUnpaidFines.fulfilled, (state, action) => {
        state.unpaidFines = action.payload;
      })
      .addCase(fetchPendingReports.fulfilled, (state, action) => {
        state.pendingReports = action.payload;
      })
      .addCase(recordContribution.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (action.payload.hasFine && !action.payload.finePaid && action.payload.status === "approved") {
          state.unpaidFines.unshift(action.payload);
        }
      })
      .addCase(reportContribution.fulfilled, (state, action) => {
        state.items = [...action.payload, ...state.items];
      })
      .addCase(approveContributionReport.fulfilled, (state, action) => {
        state.pendingReports = state.pendingReports.filter(c => c.id !== action.payload.id);
        const idx = state.items.findIndex(c => c.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        else state.items.unshift(action.payload);
        if (action.payload.hasFine && !action.payload.finePaid) {
          state.unpaidFines.unshift(action.payload);
        }
      })
      .addCase(rejectContributionReport.fulfilled, (state, action) => {
        state.pendingReports = state.pendingReports.filter(c => c.id !== action.payload);
        state.items = state.items.filter(c => c.id !== action.payload);
      })
      .addCase(markFinePaid.fulfilled, (state, action) => {
        const idx = state.items.findIndex(c => c.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        state.unpaidFines = state.unpaidFines.filter(c => c.id !== action.payload.id);
      })
      .addCase(logout.fulfilled, state => {
        state.items = [];
        state.unpaidFines = [];
        state.pendingReports = [];
        state.status = "idle";
      });
  },
});

export default contributionsSlice.reducer;
