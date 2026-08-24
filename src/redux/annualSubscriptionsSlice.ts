import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "./apiClient";
import { mapAnnualSubscription } from "./mappers";
import type { AnnualSubscription } from "./types";
import { logout } from "./authSlice";

export const fetchMyAnnualSubscriptions = createAsyncThunk(
  "annualSubscriptions/fetchMine",
  async () => {
    const data = await apiRequest<{ annual_subscriptions: Record<string, unknown>[] }>(
      "/annual_subscriptions/mine"
    );
    return data.annual_subscriptions.map(mapAnnualSubscription);
  }
);

export const fetchAnnualSubscriptions = createAsyncThunk(
  "annualSubscriptions/fetchAll",
  async () => {
    const data = await apiRequest<{ annual_subscriptions: Record<string, unknown>[] }>(
      "/annual_subscriptions"
    );
    return data.annual_subscriptions.map(mapAnnualSubscription);
  }
);

export const recordAnnualSubscription = createAsyncThunk(
  "annualSubscriptions/record",
  async (
    payload: { memberId: string; paidAt: string; year?: number },
    { rejectWithValue }
  ) => {
    try {
      const data = await apiRequest<{ annual_subscription: Record<string, unknown> }>(
        "/annual_subscriptions",
        {
          method: "POST",
          body: {
            member_id: Number(payload.memberId),
            paid_at: payload.paidAt,
            year: payload.year,
          },
        }
      );
      return mapAnnualSubscription(data.annual_subscription);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Could not record subscription");
    }
  }
);

type AnnualSubscriptionsState = {
  items: AnnualSubscription[];
  status: "idle" | "loading" | "ready" | "error";
};

const annualSubscriptionsSlice = createSlice({
  name: "annualSubscriptions",
  initialState: {
    items: [] as AnnualSubscription[],
    status: "idle",
  } as AnnualSubscriptionsState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchMyAnnualSubscriptions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "ready";
      })
      .addCase(fetchAnnualSubscriptions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "ready";
      })
      .addCase(recordAnnualSubscription.fulfilled, (state, action) => {
        const idx = state.items.findIndex(s => s.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        else state.items.unshift(action.payload);
      })
      .addCase(logout.fulfilled, state => {
        state.items = [];
        state.status = "idle";
      });
  },
});

export default annualSubscriptionsSlice.reducer;
