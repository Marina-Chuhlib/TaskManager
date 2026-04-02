import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
	TASKS: 'tasks',
	DRAFT_TASK: 'draft_task',
	CUSTOM_CATEGORIES: 'custom_categories',
};

export const storage = {
	async set<T>(key: string, value: T): Promise<void> {
		const json = JSON.stringify(value);
		await AsyncStorage.setItem(key, json);
	},

	async get<T>(key: string): Promise<T | null> {
		const json = await AsyncStorage.getItem(key);
		return json ? JSON.parse(json) : null;
	},

	async remove(key: string): Promise<void> {
		await AsyncStorage.removeItem(key);
	},
};
