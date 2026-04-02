import { configureStore } from '@reduxjs/toolkit';
import { tasksReducer } from './slices/tasksSlice';
import { filtersReducer } from './slices/filtersSlice';
import { appReducer } from './slices/appSlice';
import { categoriesReducer } from './slices/categoriesSlice';
import { tasksApi } from '../services/tasksApi';

export const store = configureStore({
	reducer: {
		tasks: tasksReducer,
		filters: filtersReducer,
		categories: categoriesReducer,
		app: appReducer,
		[tasksApi.reducerPath]: tasksApi.reducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().concat(tasksApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
