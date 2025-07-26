import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 1. Define types
interface UserData {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

interface AuthState {
  status: boolean;
  userData: UserData | null;
}

// 2. Initial state with type
const initialState: AuthState = {
  status: false,
  userData: null,
};

// 3. Create slice with proper typing
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserData>) => {
      state.status = true;
      state.userData = action.payload;
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;