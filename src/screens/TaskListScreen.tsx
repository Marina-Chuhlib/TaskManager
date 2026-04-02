import React, { useEffect, useMemo, useState } from 'react';
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	TextInput,
	StyleSheet,
	Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../navigation/types';
import { Task, Priority, BUILT_IN_CATEGORIES } from '../entities/task/types';
import {
	useDeleteTaskMutation,
	useUpdateTaskMutation,
} from '../services/tasksApi';
import type { RootState } from '../store/store';
import {
	setStatus,
	setPriority,
	setCategory,
	setDeadlinePreset,
	setSortBy,
	setSearchQuery,
} from '../store/slices/filtersSlice';
import type { DeadlinePreset } from '../utils/deadlineFilters';
import { matchesDeadlinePreset } from '../utils/deadlineFilters';
import { TaskCard } from '../components/TaskCard';
import { FilterGroup } from '../components/FilterGroup';

type NativeNav = NativeStackNavigationProp<RootStackParamList>;

const PAGE_SIZE = 15;

const TaskListScreen: React.FC = () => {
	const navigation = useNavigation<NativeNav>();
	const dispatch = useDispatch();

	const tasks = useSelector((s: RootState) => s.tasks.tasks);
	const online = useSelector((s: RootState) => s.app.online);
	const customCategories = useSelector((s: RootState) => s.categories.custom);
	const {
		status: filter,
		priority: priorityFilter,
		category: categoryFilter,
		deadlinePreset,
		sortBy: sort,
		searchQuery: search,
	} = useSelector((s: RootState) => s.filters);

	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	const [deleteTask] = useDeleteTaskMutation();
	const [updateTask] = useUpdateTaskMutation();

	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [filter, priorityFilter, categoryFilter, deadlinePreset, sort, search]);

	const categories = useMemo(() => {
		const fromTasks = new Set(
			tasks.map(t => t.category || 'Uncategorized')
		);
		const built = new Set(BUILT_IN_CATEGORIES);
		const custom = new Set(customCategories);
		return [
			'all',
			...Array.from(new Set([...fromTasks, ...built, ...custom])),
		];
	}, [tasks, customCategories]);

	const filteredTasks = useMemo(() => {
		let result = [...tasks];

		if (filter === 'completed') result = result.filter(t => t.completed);
		else if (filter === 'uncompleted')
			result = result.filter(t => !t.completed);

		if (categoryFilter !== 'all')
			result = result.filter(t => {
				const c = t.category || 'Uncategorized';
				return c === categoryFilter;
			});

		if (priorityFilter !== 'all')
			result = result.filter(t => t.priority === priorityFilter);

		if (deadlinePreset !== 'all') {
			result = result.filter(t =>
				t.deadline
					? matchesDeadlinePreset(t.deadline, deadlinePreset)
					: false
			);
		}

		if (search.trim()) {
			const s = search.toLowerCase().trim();
			result = result.filter(t => {
				const title = t.title.toLowerCase();
				const desc = (t.description || '').toLowerCase();
				const cat = (t.category || '').toLowerCase();
				return title.includes(s) || desc.includes(s) || cat.includes(s);
			});
		}

		switch (sort) {
			case 'deadline':
				result.sort(
					(a, b) =>
						new Date(a.deadline || 0).getTime() -
						new Date(b.deadline || 0).getTime()
				);
				break;
			case 'priority': {
				const order: Record<Priority, number> = {
					high: 0,
					medium: 1,
					low: 2,
				};
				result.sort((a, b) => order[a.priority] - order[b.priority]);
				break;
			}
			case 'status':
				result.sort(
					(a, b) => Number(a.completed) - Number(b.completed)
				);
				break;
		}

		return result;
	}, [
		tasks,
		filter,
		categoryFilter,
		priorityFilter,
		deadlinePreset,
		search,
		sort,
	]);

	const displayedTasks = useMemo(
		() => filteredTasks.slice(0, visibleCount),
		[filteredTasks, visibleCount]
	);

	const loadMore = () => {
		if (visibleCount >= filteredTasks.length) return;
		setVisibleCount(c => c + PAGE_SIZE);
	};

	const toggleComplete = async (task: Task) => {
		try {
			await updateTask({
				...task,
				completed: !task.completed,
				updatedAt: Date.now(),
			}).unwrap();
		} catch (err) {
			console.log('Error updating task:', err);
		}
	};

	const removeTask = (task: Task) => {
		Alert.alert('Confirmation', 'Delete this task?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					try {
						await deleteTask(task.id).unwrap();
					} catch (err) {
						console.log('Error deleting task:', err);
					}
				},
			},
		]);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.online}>{online ? 'Online' : 'Offline'}</Text>

			<TextInput
				style={styles.search}
				placeholder="Search by title and description..."
				value={search}
				onChangeText={t => dispatch(setSearchQuery(t))}
			/>

			<TouchableOpacity
				style={styles.addButton}
				onPress={() =>
					navigation.navigate('AddEditTask', {
						title: 'New Task',
					})
				}
			>
				<Text style={styles.addButtonText}>+ Add Task</Text>
			</TouchableOpacity>

			<FilterGroup
				options={['all', 'completed', 'uncompleted'] as const}
				active={filter}
				onSelect={v => dispatch(setStatus(v))}
				formatLabel={v =>
					v === 'all'
						? 'ALL'
						: v === 'completed'
						? 'COMPLETED'
						: 'ACTIVE'
				}
			/>

			<FilterGroup
				options={categories}
				active={categoryFilter}
				onSelect={v => dispatch(setCategory(v))}
			/>

			<FilterGroup
				options={['all', 'high', 'medium', 'low'] as const}
				active={priorityFilter}
				onSelect={v => dispatch(setPriority(v))}
				formatLabel={v => (v === 'all' ? 'ALL' : v.toUpperCase())}
			/>

			<FilterGroup
				options={['all', 'today', 'week', 'overdue'] as const}
				active={deadlinePreset}
				onSelect={v => dispatch(setDeadlinePreset(v))}
				formatLabel={v =>
					v === 'all'
						? 'ALL'
						: v === 'today'
						? 'TODAY'
						: v === 'week'
						? 'WEEK'
						: 'OVERDUE'
				}
			/>

			<FilterGroup
				options={['deadline', 'priority', 'status'] as const}
				active={sort}
				onSelect={v => dispatch(setSortBy(v))}
				formatLabel={v =>
					v === 'deadline'
						? 'BY DATE'
						: v === 'priority'
						? 'BY PRIORITY'
						: 'BY STATUS'
				}
			/>

			<FlatList
				data={displayedTasks}
				keyExtractor={item => item.id}
				renderItem={({ item }) => (
					<TaskCard
						item={item}
						toggleComplete={toggleComplete}
						removeTask={removeTask}
						navigation={navigation}
					/>
				)}
				onEndReached={loadMore}
				onEndReachedThreshold={0.4}
				contentContainerStyle={{ paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
};

export default TaskListScreen;

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	online: {
		marginBottom: 8,
		fontSize: 13,
		color: '#555',
		marginLeft: 'auto',
	},
	search: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		padding: 10,
		marginBottom: 12,
		fontSize: 16,
	},

	addButton: {
		backgroundColor: '#1E90FF',
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
	},
	addButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});
