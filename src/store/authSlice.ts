// host/src/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type User = { id: number; name: string; email: string; role: 'Admin' | 'User' } | null;

type AuthState = {
    user: User;
};

const initialState: AuthState = {
    user: JSON.parse(localStorage.getItem('authUser') || 'null'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
            if (action.payload) {
                localStorage.setItem('authUser', JSON.stringify(action.payload));
            } else {
                localStorage.removeItem('authUser');
            }
        },
        logout(state) {
            state.user = null;
            localStorage.removeItem('authUser');
        },
    },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
