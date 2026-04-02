import React, { useState, useEffect } from 'react';
import {
	View,
	TextInput,
	Pressable,
	StyleSheet,
	Alert,
	Text,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Task, Priority } from '../entities/task/types';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { RootStackParamList } from '../navigation/types';
import { DeadlinePicker } from '../components/DeadlinePicker';
import { PriorityPicker } from '../components/PriorityPicker';
import {
	useAddTaskMutation,
	useUpdateTaskMutation,
} from '../services/tasksApi';
import { db } from '../services/firebase';
import { STORAGE_KEYS } from '../utils/storage';
import { CategoryPicker } from '../components/CategoryPicker';
import { addCustomCategory } from '../store/slices/categoriesSlice';
import type { RootState } from '../store/store';

const isDeadlineBeforeToday = (deadlineIso: string): boolean => {
	const dayPart = deadlineIso.split('T')[0];
	const [y, m, d] = dayPart.split('-').map(Number);
	const deadlineDay = new Date(y, m - 1, d);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	deadlineDay.setHours(0, 0, 0, 0);
	return deadlineDay < today;
};

const AddEditTaskScreen: React.FC = () => {
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const route = useRoute<any>();
	const taskId = route.params?.taskId;
	const dispatch = useDispatch();

	const customCategories = useSelector((s: RootState) => s.categories.custom);

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [priority, setPriority] = useState<Priority>('low');
	const [deadline, setDeadline] = useState('');
	const [category, setCategory] = useState('Other');
	const [imageUrl, setImageUrl] = useState<string | undefined>();
	const [localImageUri, setLocalImageUri] = useState<string | undefined>();

	const [addTask] = useAddTaskMutation();
	const [updateTask] = useUpdateTaskMutation();

	useEffect(() => {
		if (!taskId) {
			AsyncStorage.getItem(STORAGE_KEYS.DRAFT_TASK).then(draft => {
				if (draft) {
					const t = JSON.parse(draft) as Partial<Task>;
					setTitle(t.title || '');
					setDescription(t.description || '');
					setPriority(t.priority || 'low');
					setDeadline(t.deadline || '');
					setCategory(t.category || 'Other');
					setImageUrl(t.imageUrl);
				}
			});
			return;
		}

		const unsubscribe = db
			.collection('tasks')
			.doc(taskId)
			.onSnapshot(doc => {
				if (doc.exists()) {
					const t = doc.data() as Task;
					setTitle(t.title);
					setDescription(t.description || '');
					setPriority(t.priority || 'low');
					setDeadline(t.deadline || '');
					setCategory(t.category || 'Other');
					setImageUrl(t.imageUrl);
					setLocalImageUri(undefined);
				}
			});

		return () => unsubscribe();
	}, [taskId]);

	useEffect(() => {
		if (!taskId) {
			const draft: Partial<Task> = {
				title,
				description,
				priority,
				deadline,
				category,
				imageUrl,
			};
			AsyncStorage.setItem(
				STORAGE_KEYS.DRAFT_TASK,
				JSON.stringify(draft)
			);
		}
	}, [title, description, priority, deadline, category, imageUrl, taskId]);

	const pickImage = () => {
		launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 }, res => {
			const uri = res.assets?.[0]?.uri;
			if (uri) {
				setLocalImageUri(uri);
				setImageUrl(undefined);
			}
		});
	};

	const handleSave = async () => {
		if (!title.trim()) {
			return Alert.alert('Validation', 'Please enter a title');
		}
		if (!deadline.trim()) {
			return Alert.alert('Validation', 'Please select a deadline');
		}
		if (!taskId && isDeadlineBeforeToday(deadline)) {
			return Alert.alert('Validation', 'Deadline cannot be in the past');
		}

		const id = taskId || uuidv4();

		try {
			let completed = false;
			if (taskId) {
				const prev = await db.collection('tasks').doc(taskId).get();
				completed =
					(prev.data() as Task | undefined)?.completed ?? false;
			}

			const taskData: Task = {
				id,
				title: title.trim(),
				description: description.trim() || undefined,
				priority,
				deadline,
				completed,
				updatedAt: Date.now(),
				category,
				imageUrl: localImageUri,
			};

			if (taskId) {
				await updateTask(taskData).unwrap();
			} else {
				await addTask(taskData).unwrap();
				await AsyncStorage.removeItem(STORAGE_KEYS.DRAFT_TASK);
			}
			navigation.goBack();
		} catch (err) {
			Alert.alert('Error', 'Failed to save the task');
			console.error(err);
		}
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={80}
		>
			<ScrollView
				contentContainerStyle={styles.container}
				showsVerticalScrollIndicator={false}
			>
				<Text>Title</Text>
				<TextInput
					style={styles.input}
					placeholder="Title"
					value={title}
					onChangeText={setTitle}
				/>

				<Text>Deadline</Text>
				<DeadlinePicker deadline={deadline} setDeadline={setDeadline} />
				<Text>Priority</Text>
				<PriorityPicker priority={priority} setPriority={setPriority} />
				<Text>Category</Text>
				<CategoryPicker
					category={category}
					setCategory={setCategory}
					customCategories={customCategories}
					onAddCustomCategory={name =>
						dispatch(addCustomCategory(name))
					}
				/>

				<Text>Description</Text>
				<TextInput
					style={[
						styles.input,
						{ height: 140, textAlignVertical: 'top' },
					]}
					placeholder="Description"
					value={description}
					onChangeText={setDescription}
					multiline
					maxLength={200}
				/>

				<Text>Attachment</Text>
				{localImageUri || imageUrl ? (
					<View style={{ alignItems: 'center' }}>
						<Image
							source={{ uri: localImageUri || imageUrl }}
							style={styles.preview}
							// resizeMode="cover"
							resizeMode="contain"
						/>
					</View>
				) : null}
				<Pressable
					style={({ pressed }) => [
						styles.secondaryBtn,
						pressed && styles.buttonPressed,
					]}
					onPress={pickImage}
				>
					<Text style={styles.secondaryBtnText}>
						{localImageUri || imageUrl
							? 'Change image'
							: '+ Add image'}
					</Text>
				</Pressable>

				<Pressable
					style={({ pressed }) => [
						styles.button,
						pressed && styles.buttonPressed,
					]}
					onPress={handleSave}
				>
					<Text style={styles.buttonText}>Save</Text>
				</Pressable>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default AddEditTaskScreen;

const styles = StyleSheet.create({
	container: { flexGrow: 1, padding: 16 },
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		height: 52,
		paddingHorizontal: 12,
		marginBottom: 12,
		fontSize: 18,
	},
	preview: {
		width: 80,
		height: 80,
		borderRadius: 8,
		marginBottom: 12,
		backgroundColor: '#eee',
	},
	secondaryBtn: {
		borderWidth: 1,
		borderColor: '#2685ea',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginBottom: 12,
		backgroundColor: '#4896ea13',
	},
	secondaryBtnText: { color: '#2685ea', fontWeight: '600' },
	button: {
		backgroundColor: '#2685ea',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 8,
	},
	buttonPressed: {
		opacity: 0.7,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});
