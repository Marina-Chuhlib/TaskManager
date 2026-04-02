import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  online: boolean;
}

const initialState: AppState = { online: true };

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnline(state, action: PayloadAction<boolean>) {
      state.online = action.payload;
    },
  },
});

export const appReducer = appSlice.reducer;
export const { setOnline } = appSlice.actions;