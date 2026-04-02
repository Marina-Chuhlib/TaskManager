import { Task } from '../entities/task/types';

export const mergeTasksByUpdatedAt = (a: Task[], b: Task[]): Task[] => {
	const map = new Map<string, Task>();
	for (const t of [...a, ...b]) {
		const existing = map.get(t.id);
		if (!existing || t.updatedAt >= existing.updatedAt) {
			map.set(t.id, t);
		}
	}
	return Array.from(map.values());
};

export const resolveTaskConflict = (local: Task, remote: Task): Task => {
	return local.updatedAt >= remote.updatedAt ? local : remote;
};
