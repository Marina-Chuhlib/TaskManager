import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { DeadlinePreset } from '../../utils/deadlineFilters';

export type SortOption = 'deadline' | 'priority' | 'status';

export interface FiltersState {
	status: 'all' | 'completed' | 'uncompleted';
	priority: 'all' | 'low' | 'medium' | 'high';
	category: string | 'all';
	deadlinePreset: DeadlinePreset;
	sortBy: SortOption;
	searchQuery: string;
}

const initialState: FiltersState = {
	status: 'all',
	priority: 'all',
	category: 'all',
	deadlinePreset: 'all',
	sortBy: 'deadline',
	searchQuery: '',
};

export const filtersSlice = createSlice({
	name: 'filters',
	initialState,
	reducers: {
		setStatus(state, action: PayloadAction<FiltersState['status']>) {
			state.status = action.payload;
		},
		setPriority(state, action: PayloadAction<FiltersState['priority']>) {
			state.priority = action.payload;
		},
		setCategory(state, action: PayloadAction<FiltersState['category']>) {
			state.category = action.payload;
		},
		setDeadlinePreset(state, action: PayloadAction<DeadlinePreset>) {
			state.deadlinePreset = action.payload;
		},
		setSortBy(state, action: PayloadAction<SortOption>) {
			state.sortBy = action.payload;
		},
		setSearchQuery(state, action: PayloadAction<string>) {
			state.searchQuery = action.payload;
		},
		resetFilters(state) {
			state.status = 'all';
			state.priority = 'all';
			state.category = 'all';
			state.deadlinePreset = 'all';
			state.sortBy = 'deadline';
			state.searchQuery = '';
		},
	},
});

export const {
	setStatus,
	setPriority,
	setCategory,
	setDeadlinePreset,
	setSortBy,
	setSearchQuery,
	resetFilters,
} = filtersSlice.actions;
export const filtersReducer = filtersSlice.reducer;
