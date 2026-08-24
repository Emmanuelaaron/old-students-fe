import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ApiError, apiRequest } from "./apiClient";
import { mapMember } from "./mappers";
import type { Member, MemberRole } from "./types";
import { register, logout, bootstrapAuth, verifyOtp } from "./authSlice";

export const fetchApprovedMembers = createAsyncThunk("members/fetchApproved", async () => {
  const data = await apiRequest<{ members: Record<string, unknown>[] }>("/members");
  return data.members.map(mapMember);
});

export const fetchPendingMembers = createAsyncThunk("members/fetchPending", async () => {
  const data = await apiRequest<{ members: Record<string, unknown>[] }>("/members/pending");
  return data.members.map(mapMember);
});

export const approveMember = createAsyncThunk("members/approve", async (id: string) => {
  const data = await apiRequest<{ member: Record<string, unknown> }>(`/members/${id}/approve`, {
    method: "POST",
  });
  return mapMember(data.member);
});

export const rejectMember = createAsyncThunk("members/reject", async (id: string) => {
  await apiRequest(`/members/${id}`, { method: "DELETE" });
  return id;
});

export const assignMemberRole = createAsyncThunk(
  "members/assignRole",
  async (
    { id, role, force = false }: { id: string; role: MemberRole; force?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const data = await apiRequest<{ member: Record<string, unknown> }>(`/members/${id}/assign_role`, {
        method: "POST",
        body: { role, force },
      });
      return mapMember(data.member);
    } catch (e) {
      if (e instanceof ApiError && e.data?.needsConfirmation) {
        return rejectWithValue({
          needsConfirmation: true,
          currentHolder: e.data.currentHolder,
          message: e.message,
        });
      }
      return rejectWithValue(e instanceof Error ? e.message : "Could not assign role");
    }
  }
);

type MembersState = {
  items: Member[];
  pending: Member[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
};

const membersSlice = createSlice({
  name: "members",
  initialState: {
    items: [] as Member[],
    pending: [] as Member[],
    status: "idle",
    error: null,
  } as MembersState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchApprovedMembers.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "ready";
      })
      .addCase(fetchPendingMembers.fulfilled, (state, action) => {
        state.pending = action.payload;
      })
      .addCase(approveMember.fulfilled, (state, action) => {
        state.pending = state.pending.filter(m => m.id !== action.payload.id);
        if (!state.items.some(m => m.id === action.payload.id)) {
          state.items.push(action.payload);
        }
      })
      .addCase(rejectMember.fulfilled, (state, action) => {
        state.pending = state.pending.filter(m => m.id !== action.payload);
        state.items = state.items.filter(m => m.id !== action.payload);
      })
      .addCase(assignMemberRole.fulfilled, (state, action) => {
        state.items = state.items.map(m => (m.id === action.payload.id ? action.payload : m));
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        const m = action.payload.member;
        if (m.approved && !state.items.some(x => x.id === m.id)) state.items.push(m);
      })
      .addCase(register.fulfilled, (state, action) => {
        state.pending.push(action.payload.member);
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        if (!action.payload) return;
        const m = action.payload.member;
        if (m.approved && !state.items.some(x => x.id === m.id)) state.items.push(m);
      })
      .addCase(logout.fulfilled, state => {
        state.items = [];
        state.pending = [];
        state.status = "idle";
      });
  },
});

export default membersSlice.reducer;
