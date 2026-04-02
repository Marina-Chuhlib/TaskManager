import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CategoriesState {
	custom: string[];
}

const initialState: CategoriesState = {
	custom: [],
};

export const categoriesSlice = createSlice({
	name: 'categories',
	initialState,
	reducers: {
		setCustomCategories(state, action: PayloadAction<string[]>) {
			state.custom = action.payload;
		},
		addCustomCategory(state, action: PayloadAction<string>) {
			const t = action.payload.trim();
			if (t && !state.custom.includes(t)) state.custom.push(t);
		},
	},
});

export const { setCustomCategories, addCustomCategory } =
	categoriesSlice.actions;
export const categoriesReducer = categoriesSlice.reducer;
