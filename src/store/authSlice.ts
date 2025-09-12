import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// type for user data and auth state
interface UserData {
  id: string;
  name: string;
  email: string;
  
}

interface AuthState {
  status: boolean;
  userData: UserData | null;
}

// initial state
const initialState: AuthState = {
  status: false,
  userData: null,
};

//auth slice with reducers for login and logout
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