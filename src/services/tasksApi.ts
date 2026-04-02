import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Task } from '../entities/task/types';
import firestore from '@react-native-firebase/firestore';
import { storage, STORAGE_KEYS } from '../utils/storage';

type QueryGetTasks = {
	limit: number;
	lastDocSnapshot?: FirebaseFirestoreTypes.DocumentSnapshot | null;
};

type ResultGetTasks = {
	tasks: Task[];
	lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
};

function stripUndefined<T extends Record<string, unknown>>(o: T): T {
	const out = { ...o };
	Object.keys(out).forEach(k => {
		if (out[k] === undefined) delete out[k];
	});
	return out as T;
}

const taskToFirestoreUpdatePayload = (task: Task): Record<string, unknown> => {
	const { id: _id, ...rest } = task;
	const payload: Record<string, unknown> = {
		...rest,
		updatedAt: Date.now(),
	};
	Object.keys(payload).forEach(k => {
		if (payload[k] === undefined) delete payload[k];
	});
	return payload;
};

export const tasksApi = createApi({
	reducerPath: 'tasksApi',
	baseQuery: fakeBaseQuery(),
	tagTypes: ['Tasks'],
	endpoints: builder => ({
		getTasks: builder.query<ResultGetTasks, QueryGetTasks>({
			async queryFn({ limit, lastDocSnapshot }) {
				try {
					let query = firestore()
						.collection('tasks')
						.orderBy('updatedAt', 'desc')
						.limit(limit);

					if (lastDocSnapshot)
						query = query.startAfter(lastDocSnapshot);

					const snapshot = await query.get();

					const tasks: Task[] = snapshot.docs.map(
						doc => ({ id: doc.id, ...doc.data() } as Task)
					);

					const lastVisible =
						snapshot.docs.length > 0
							? snapshot.docs[snapshot.docs.length - 1]
							: null;

					return { data: { tasks, lastVisible } };
				} catch (err) {
					return { error: err as any };
				}
			},
			providesTags: result =>
				result
					? [
							...result.tasks.map(t => ({
								type: 'Tasks' as const,
								id: t.id,
							})),
							{ type: 'Tasks' as const, id: 'LIST' },
					  ]
					: [{ type: 'Tasks' as const, id: 'LIST' }],
		}),

		addTask: builder.mutation<Task, Task>({
			async queryFn(task) {
				try {
					const docRef = firestore().collection('tasks').doc(task.id);
					const updatedTask = { ...task, updatedAt: Date.now() };
					await docRef.set(
						stripUndefined({ ...updatedTask } as Record<
							string,
							unknown
						>)
					);

					const local = await storage.get<Task[]>(STORAGE_KEYS.TASKS);
					const tasks: Task[] = local ?? [];
					const merged = [
						updatedTask,
						...tasks.filter(t => t.id !== task.id),
					];
					await storage.set(STORAGE_KEYS.TASKS, merged);

					return { data: updatedTask };
				} catch (error) {
					return { error: error as any };
				}
			},
			invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
		}),

		updateTask: builder.mutation<Task, Task>({
			async queryFn(task) {
				try {
					const updatedAt = Date.now();
					const updatedTask: Task = { ...task, updatedAt };
					const payload = taskToFirestoreUpdatePayload(updatedTask);
					await firestore()
						.collection('tasks')
						.doc(task.id)
						.update(payload);

					const local = await storage.get<Task[]>(STORAGE_KEYS.TASKS);
					const tasks: Task[] = local ?? [];
					const idx = tasks.findIndex(t => t.id === task.id);
					if (idx !== -1) tasks[idx] = updatedTask;
					else tasks.unshift(updatedTask);
					await storage.set(STORAGE_KEYS.TASKS, tasks);

					return { data: updatedTask };
				} catch (error) {
					return { error: error as any };
				}
			},
			invalidatesTags: (result, error, arg) => [
				{ type: 'Tasks', id: arg.id },
				{ type: 'Tasks', id: 'LIST' },
			],
		}),

		deleteTask: builder.mutation<string, string>({
			async queryFn(id) {
				try {
					await firestore().collection('tasks').doc(id).delete();

					const local = await storage.get<Task[]>(STORAGE_KEYS.TASKS);
					const tasks: Task[] = local ?? [];
					const filtered = tasks.filter(t => t.id !== id);
					await storage.set(STORAGE_KEYS.TASKS, filtered);

					return { data: id };
				} catch (error) {
					return { error: error as any };
				}
			},
			invalidatesTags: (result, error, id) => [
				{ type: 'Tasks', id },
				{ type: 'Tasks', id: 'LIST' },
			],
		}),
	}),
});

export const {
	useGetTasksQuery,
	useAddTaskMutation,
	useUpdateTaskMutation,
	useDeleteTaskMutation,
	useLazyGetTasksQuery,
} = tasksApi;
