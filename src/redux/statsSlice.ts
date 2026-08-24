import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "./apiClient";
import { CONTRIBUTION, FINE_AMT } from "./types";

export const fetchStats = createAsyncThunk("stats/fetch", async () => {
  const data = await apiRequest<{
    approvedCount: number;
    monthlyContribution: number;
    fineAmount: number;
    fineRate: number;
    annualSubscriptionAmount: number;
  }>("/stats", { auth: false });
  return data;
});

type StatsState = {
  approvedCount: number;
  monthlyContribution: number;
  fineAmount: number;
  annualSubscriptionAmount: number;
  status: "idle" | "ready" | "error";
};

const statsSlice = createSlice({
  name: "stats",
  initialState: {
    approvedCount: 0,
    monthlyContribution: CONTRIBUTION,
    fineAmount: FINE_AMT,
    annualSubscriptionAmount: 50_000,
    status: "idle",
  } as StatsState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchStats.fulfilled, (state, action) => {
      state.approvedCount = action.payload.approvedCount;
      state.monthlyContribution = action.payload.monthlyContribution;
      state.fineAmount = action.payload.fineAmount;
      state.annualSubscriptionAmount = action.payload.annualSubscriptionAmount ?? 50_000;
      state.status = "ready";
    });
  },
});

export default statsSlice.reducer;
