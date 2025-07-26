import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status:false,
    userData:null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state: any, action:any) => {
            state.status = true;
            state.userData = action.payload;
        },
        logout: (state: any) => {
            state.status = false;
            state.userData = null;
        },
    },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
