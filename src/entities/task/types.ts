export type Priority = 'low' | 'medium' | 'high';

export const BUILT_IN_CATEGORIES = [
	'Work',
	'Personal',
	'Shopping',
	'Health',
	'Study',
	'Finance',
	'Other',
] as const;

export interface Task {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	priority: Priority;
	deadline: string;
	category?: string;
	imageUrl?: string;
	updatedAt: number;
}
