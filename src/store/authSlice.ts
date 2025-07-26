import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status:false,
    userData:null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state: { status: boolean; userData: any; }, action: { payload: unknown }) => {
            state.status = true;
            state.userData = action.payload;
        },
        logout: (state: { status: boolean; userData: any; }) => {
            state.status = false;
            state.userData = null;
        },
    },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
