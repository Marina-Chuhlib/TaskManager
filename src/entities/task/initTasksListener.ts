import { subscribeToTasks } from '../../services/tasksService';
import { setTasks } from '../../store/slices/tasksSlice';
import type { AppDispatch } from '../../store/store';
import { storage, STORAGE_KEYS } from '../../utils/storage';
import { Task } from './types';

export const initTasksListener = () => (dispatch: AppDispatch) => {
	const unsubscribe = subscribeToTasks(tasks => {
		dispatch(setTasks(tasks));
		void storage.set(STORAGE_KEYS.TASKS, tasks);
	});
	return unsubscribe;
};

export const hydrateTasksFromCache = () => async (dispatch: AppDispatch) => {
	const cached = await storage.get<Task[]>(STORAGE_KEYS.TASKS);
	if (cached?.length) dispatch(setTasks(cached));
};
