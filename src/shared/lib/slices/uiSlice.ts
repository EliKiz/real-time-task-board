import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export interface UiState {
  users: User[];
  usersLoading: boolean;
  usersError: string | null;
}

const initialState: UiState = {
  users: [],
  usersLoading: false,
  usersError: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<UiState['users']>) => {
      state.users = action.payload;
    },
    setUsersLoading: (state, action: PayloadAction<boolean>) => {
      state.usersLoading = action.payload;
    },
    setUsersError: (state, action: PayloadAction<string | null>) => {
      state.usersError = action.payload;
    },
  },
});

export const { setUsers, setUsersLoading, setUsersError } = uiSlice.actions;

export default uiSlice.reducer; 