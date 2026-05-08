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
import { useForm, Controller } from 'react-hook-form';
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
import { uploadPhotoToImgbb } from '../utils/uploadPhotoToImgbb';

const isDeadlineBeforeToday = (deadlineIso: string): boolean => {
	const dayPart = deadlineIso.split('T')[0];
	const [y, m, d] = dayPart.split('-').map(Number);
	const deadlineDay = new Date(y, m - 1, d);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	deadlineDay.setHours(0, 0, 0, 0);
	return deadlineDay < today;
};

type TaskFormValues = {
	title: string;
	description?: string;
	priority: Priority;
	deadline: string;
	category: string;
	imageUrl?: string;
};

const AddEditTaskScreen: React.FC = () => {
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const route = useRoute<any>();
	const taskId = route.params?.taskId;
	const dispatch = useDispatch();
	const customCategories = useSelector((s: RootState) => s.categories.custom);

	const [localImageUri, setLocalImageUri] = useState<string | undefined>();
	const [addTask] = useAddTaskMutation();
	const [updateTask] = useUpdateTaskMutation();

	const { control, handleSubmit, setValue, watch } = useForm<TaskFormValues>({
		defaultValues: {
			title: '',
			description: '',
			priority: 'low',
			deadline: '',
			category: 'Other',
			imageUrl: undefined,
		},
	});

	const watchedValues = watch();

	useEffect(() => {
		if (!taskId) {
			AsyncStorage.getItem(STORAGE_KEYS.DRAFT_TASK).then(draft => {
				if (draft) {
					const t = JSON.parse(draft) as Partial<Task>;
					Object.entries(t).forEach(([key, val]) => {
						setValue(key as keyof TaskFormValues, val);
					});
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
					Object.entries({
						title: t.title,
						description: t.description,
						priority: t.priority,
						deadline: t.deadline,
						category: t.category,
						imageUrl: t.imageUrl,
					}).forEach(([key, val]) => {
						setValue(key as keyof TaskFormValues, val);
					});
					setLocalImageUri(undefined);
				}
			});

		return () => unsubscribe();
	}, [taskId, setValue]);

	useEffect(() => {
		if (!taskId) {
			AsyncStorage.setItem(
				STORAGE_KEYS.DRAFT_TASK,
				JSON.stringify(watchedValues)
			);
		}
	}, [watchedValues, taskId]);

	const pickImage = () => {
		launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 }, res => {
			const uri = res.assets?.[0]?.uri;
			if (uri) {
				setLocalImageUri(uri);
				setValue('imageUrl', undefined);
			}
		});
	};

	const onSubmit = async (data: TaskFormValues) => {
		if (!data.title.trim())
			return Alert.alert('Validation', 'Please enter a title');
		if (!data.deadline.trim())
			return Alert.alert('Validation', 'Please select a deadline');
		if (!taskId && isDeadlineBeforeToday(data.deadline)) {
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

			let finalImageUrl = data.imageUrl;
			if (localImageUri)
				finalImageUrl = await uploadPhotoToImgbb(localImageUri);

			const taskData: Task = {
				id,
				title: data.title.trim(),
				description: data.description?.trim(),
				priority: data.priority,
				deadline: data.deadline,
				completed,
				updatedAt: Date.now(),
				category: data.category,
				imageUrl: finalImageUrl || '',
			};

			if (taskId) await updateTask(taskData).unwrap();
			else {
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
				<Controller
					control={control}
					name="title"
					render={({ field: { value, onChange } }) => (
						<TextInput
							style={styles.input}
							placeholder="Title"
							value={value}
							onChangeText={onChange}
						/>
					)}
				/>

				<Text>Deadline</Text>
				<Controller
					control={control}
					name="deadline"
					render={({ field: { value, onChange } }) => (
						<DeadlinePicker
							deadline={value}
							setDeadline={onChange}
						/>
					)}
				/>

				<Text>Priority</Text>
				<Controller
					control={control}
					name="priority"
					render={({ field: { value, onChange } }) => (
						<PriorityPicker
							priority={value}
							setPriority={onChange}
						/>
					)}
				/>

				<Text>Category</Text>
				<Controller
					control={control}
					name="category"
					render={({ field: { value, onChange } }) => (
						<CategoryPicker
							category={value}
							setCategory={onChange}
							customCategories={customCategories}
							onAddCustomCategory={name =>
								dispatch(addCustomCategory(name))
							}
						/>
					)}
				/>

				<Text>Description</Text>
				<Controller
					control={control}
					name="description"
					render={({ field: { value, onChange } }) => (
						<TextInput
							style={[
								styles.input,
								{ height: 140, textAlignVertical: 'top' },
							]}
							placeholder="Description"
							value={value}
							onChangeText={onChange}
							multiline
							maxLength={200}
						/>
					)}
				/>

				<Text>Attachment</Text>
				{(localImageUri || watchedValues.imageUrl) && (
					<View style={{ alignItems: 'center' }}>
						<Pressable
							style={({ pressed }) => [
								styles.secondaryBtn,
								pressed && styles.buttonPressed,
								{ marginLeft: 'auto', marginRight: 20 },
							]}
							onPress={() => {
								setLocalImageUri(undefined);
								setValue('imageUrl', undefined);
							}}
						>
							<Text style={styles.secondaryBtnText}>❌</Text>
						</Pressable>
						<Image
							source={{
								uri: localImageUri || watchedValues.imageUrl,
							}}
							style={styles.preview}
							resizeMode="contain"
						/>
					</View>
				)}
				<Pressable
					style={({ pressed }) => [
						styles.secondaryBtn,
						pressed && styles.buttonPressed,
					]}
					onPress={pickImage}
				>
					<Text style={styles.secondaryBtnText}>
						{localImageUri || watchedValues.imageUrl
							? 'Change image'
							: '+ Add image'}
					</Text>
				</Pressable>

				<Pressable
					style={({ pressed }) => [
						styles.button,
						pressed && styles.buttonPressed,
					]}
					onPress={handleSubmit(onSubmit)}
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
