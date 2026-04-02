import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { db } from './firebase';
import { Task } from '../entities/task/types';

export const addTaskToFirestore = async (task: Task) => {
	const docRef = await db.collection('tasks').add(task);
	return docRef.id;
};

export const updateTaskInFirestore = async (task: Task) => {
	await db.collection('tasks').doc(task.id).update(task);
};

export const deleteTaskFromFirestore = async (id: string) => {
	await db.collection('tasks').doc(id).delete();
};

const mapDocToTask = (
	doc: FirebaseFirestoreTypes.QueryDocumentSnapshot
): Task => {
	const data = doc.data();
	return {
		id: doc.id,
		title: (data.title as string) ?? '',
		description: data.description as string | undefined,
		priority: (data.priority as Task['priority']) ?? 'low',
		completed: Boolean(data.completed),
		deadline: (data.deadline as string) ?? '',
		category: data.category as string | undefined,
		imageUrl: data.imageUrl as string | undefined,
		updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : 0,
	};
};

export const subscribeToTasks = (
	callback: (tasks: Task[]) => void
): (() => void) => {
	return db
		.collection('tasks')
		.orderBy('updatedAt', 'desc')
		.onSnapshot(snapshot => {
			const tasks = snapshot.docs.map(d => mapDocToTask(d));
			callback(tasks);
		});
};
