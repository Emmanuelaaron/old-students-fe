import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { apiRequest, setStoredToken, getStoredToken } from "./apiClient";
import { mapMember, mapNextOfKin } from "./mappers";
import type {
  Member,
  NextOfKin,
  NextOfKinInput,
  ProfileUpdateInput,
  RegisterInput,
} from "./types";
import { RELATIONSHIP_OPTIONS } from "./types";

type AuthResponse = { token: string; member: Record<string, unknown> };

export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrap",
  async (_, { rejectWithValue }) => {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const data = await apiRequest<{
        member: Record<string, unknown>;
        relationships?: string[];
      }>("/auth/me");
      return {
        member: mapMember(data.member),
        relationships: data.relationships ?? [...RELATIONSHIP_OPTIONS],
      };
    } catch {
      setStoredToken(null);
      return rejectWithValue("Session expired");
    }
  }
);

export const requestOtp = createAsyncThunk(
  "auth/requestOtp",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const data = await apiRequest<{ message: string; emailHint?: string }>("/auth/request_otp", {
        method: "POST",
        auth: false,
        body: { identifier },
      });
      return data;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Could not send login code");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (
    { identifier, code }: { identifier: string; code: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await apiRequest<{
        token: string;
        member: Record<string, unknown>;
        relationships?: string[];
      }>("/auth/verify_otp", {
        method: "POST",
        auth: false,
        body: { identifier, code },
      });
      setStoredToken(data.token);
      return {
        member: mapMember(data.member),
        relationships: data.relationships ?? [...RELATIONSHIP_OPTIONS],
      };
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Invalid or expired code");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (input: RegisterInput, { rejectWithValue }) => {
    try {
      const data = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        auth: false,
        body: {
          firstName: input.firstName,
          lastName: input.lastName,
          occupation: input.occupation,
          dateOfBirth: input.dateOfBirth,
          tel: input.tel,
          address: input.address,
          gender: input.gender,
          email: input.email,
          nextOfKins: input.nextOfKins,
        },
      });
      setStoredToken(data.token);
      return {
        member: mapMember(data.member),
        relationships: data.relationships ?? [...RELATIONSHIP_OPTIONS],
      };
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Registration failed");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await apiRequest("/auth/logout", { method: "DELETE" });
  } catch {
    // clear local session even if API fails
  } finally {
    setStoredToken(null);
  }
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (input: ProfileUpdateInput, { rejectWithValue }) => {
    try {
      const body: Record<string, string> = {
        firstName: input.firstName,
        lastName: input.lastName,
        occupation: input.occupation,
        dateOfBirth: input.dateOfBirth,
        tel: input.tel,
        address: input.address,
        gender: input.gender,
        email: input.email,
      };

      const data = await apiRequest<{ member: Record<string, unknown> }>("/profile", {
        method: "PATCH",
        body,
      });
      return mapMember(data.member);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Could not update profile");
    }
  }
);

export const addNextOfKin = createAsyncThunk(
  "auth/addNextOfKin",
  async (input: NextOfKinInput, { rejectWithValue }) => {
    try {
      const data = await apiRequest<{ nextOfKin: Record<string, unknown> }>("/next_of_kins", {
        method: "POST",
        body: input,
      });
      return mapNextOfKin(data.nextOfKin);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Could not add next of kin");
    }
  }
);

export const updateNextOfKin = createAsyncThunk(
  "auth/updateNextOfKin",
  async (
    { id, ...input }: NextOfKinInput & { id: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await apiRequest<{ nextOfKin: Record<string, unknown> }>(`/next_of_kins/${id}`, {
        method: "PATCH",
        body: input,
      });
      return mapNextOfKin(data.nextOfKin);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Could not update next of kin");
    }
  }
);

export const removeNextOfKin = createAsyncThunk(
  "auth/removeNextOfKin",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiRequest(`/next_of_kins/${id}`, { method: "DELETE" });
      return id;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Could not remove next of kin");
    }
  }
);

type AuthState = {
  user: Member | null;
  relationships: string[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    relationships: [...RELATIONSHIP_OPTIONS],
    status: "idle",
    error: null,
  } as AuthState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    patchCurrentUser(state, action: PayloadAction<Member>) {
      state.user = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(bootstrapAuth.pending, state => {
        state.status = "loading";
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.member;
          state.relationships = action.payload.relationships;
        } else {
          state.user = null;
        }
        state.status = "ready";
        state.error = null;
      })
      .addCase(bootstrapAuth.rejected, state => {
        state.user = null;
        state.status = "ready";
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.user = action.payload.member;
        state.relationships = action.payload.relationships;
        state.error = null;
        state.status = "ready";
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.error = (action.payload as string) || "Login failed";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.member;
        state.relationships = action.payload.relationships;
        state.error = null;
        state.status = "ready";
      })
      .addCase(register.rejected, (state, action) => {
        state.error = (action.payload as string) || "Registration failed";
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.status = "ready";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(addNextOfKin.fulfilled, (state, action) => {
        if (!state.user) return;
        state.user.nextOfKins = [...(state.user.nextOfKins ?? []), action.payload];
      })
      .addCase(updateNextOfKin.fulfilled, (state, action) => {
        if (!state.user?.nextOfKins) return;
        state.user.nextOfKins = state.user.nextOfKins.map(n =>
          n.id === action.payload.id ? action.payload : n
        );
      })
      .addCase(removeNextOfKin.fulfilled, (state, action) => {
        if (!state.user?.nextOfKins) return;
        state.user.nextOfKins = state.user.nextOfKins.filter(n => n.id !== action.payload);
      });
  },
});

export const { clearAuthError, patchCurrentUser } = authSlice.actions;
export default authSlice.reducer;
