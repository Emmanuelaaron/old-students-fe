import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "./apiClient";
import { mapRoleHistory } from "./mappers";
import type { RoleHistory } from "./types";
import { logout } from "./authSlice";

export const fetchRoleHistory = createAsyncThunk("roleHistory/fetch", async () => {
  const data = await apiRequest<{ role_histories: Record<string, unknown>[] }>(
    "/role_histories"
  );
  return data.role_histories.map(mapRoleHistory);
});

type RoleHistoryState = {
  items: RoleHistory[];
  status: "idle" | "loading" | "ready" | "error";
};

const roleHistorySlice = createSlice({
  name: "roleHistory",
  initialState: {
    items: [] as RoleHistory[],
    status: "idle",
  } as RoleHistoryState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchRoleHistory.pending, state => {
        state.status = "loading";
      })
      .addCase(fetchRoleHistory.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "ready";
      })
      .addCase(fetchRoleHistory.rejected, state => {
        state.status = "error";
      })
      .addCase(logout.fulfilled, state => {
        state.items = [];
        state.status = "idle";
      });
  },
});

export default roleHistorySlice.reducer;
