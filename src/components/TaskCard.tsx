import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useState } from 'react';
import { format } from 'date-fns';
import { Task } from '../entities/task/types';

type TaskCardProps = {
	item: Task;
	toggleComplete: (task: Task) => void;
	removeTask: (task: Task) => void;
	navigation: any;
};

export const TaskCard: React.FC<TaskCardProps> = ({
	item,
	toggleComplete,
	removeTask,
	navigation,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const dl = item.deadline ? new Date(item.deadline).getTime() : 0;
	const isDueSoon =
		!item.completed &&
		item.deadline &&
		dl - Date.now() > 0 &&
		dl - Date.now() < 24 * 60 * 60 * 1000;
	const isOverdue = !item.completed && item.deadline && dl < Date.now();

	return (
		<View style={styles.card}>
			<TouchableOpacity onPress={() => toggleComplete(item)}>
				<View style={styles.header}>
					<Text
						style={[
							styles.title,
							item.completed && styles.completed,
						]}
						numberOfLines={1}
					>
						{item.title}
					</Text>

					{isOverdue && <Text style={styles.overdue}>Overdue</Text>}
					{!isOverdue && isDueSoon && (
						<Text style={styles.soon}>Soon</Text>
					)}
				</View>
			</TouchableOpacity>

			{item.description && (
				<>
					<Text style={styles.description}>
						{isExpanded
							? item.description
							: item.description.slice(0, 90) +
							  (item.description.length > 90 ? '…' : '')}
					</Text>

					{item.description.length > 80 && (
						<TouchableOpacity
							style={styles.showMoreBtn}
							onPress={() => setIsExpanded(!isExpanded)}
							hitSlop={{ top: 15, left: 15, right: 15 }}
						>
							<Text style={styles.showMoreText}>
								{isExpanded ? 'Less' : 'More'}
							</Text>
						</TouchableOpacity>
					)}
				</>
			)}

			<View style={styles.meta}>
				<Text style={styles.deadline}>
					Deadline:{' '}
					{item.deadline
						? format(new Date(item.deadline), 'dd MMM yyyy')
						: 'No deadline'}
				</Text>
				<Text style={styles.category}>{item.category}</Text>

				<View style={[styles.badge, styles[item.priority]]}>
					<Text style={styles.badgeText}>{item.priority}</Text>
				</View>
			</View>

			{item.imageUrl && (
				<Image
					source={{ uri: item.imageUrl }}
					style={styles.image}
					resizeMode="contain"
				/>
			)}

			<View style={styles.actions}>
				<Text style={styles.updateAtText}>
					Updated At:{' '}
					{format(new Date(item.updatedAt), 'dd MMM yyyy, HH:mm')}
				</Text>

				<TouchableOpacity
					onPress={() =>
						navigation.navigate('AddEditTask', { taskId: item.id })
					}
				>
					<Text style={styles.edit}>Edit</Text>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => removeTask(item)}>
					<Text style={styles.delete}>Delete</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 14,
		marginBottom: 12,
		shadowColor: '#23222246',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
	},

	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},

	title: {
		fontSize: 16,
		fontWeight: '600',
		flex: 1,
		marginRight: 8,
	},

	completed: {
		textDecorationLine: 'line-through',
		color: '#9ca3af',
	},

	overdue: {
		color: '#ef4444',
		fontSize: 12,
		fontWeight: '600',
	},

	soon: {
		color: '#f59e0b',
		fontSize: 12,
		fontWeight: '600',
	},

	description: {
		marginTop: 6,
		color: '#6b7280',
	},

	category: {
		fontSize: 12,
		color: '#555',
		fontWeight: '600',
		backgroundColor: '#cfd8e270',
		borderRadius: 12,
		paddingHorizontal: 10,
		paddingVertical: 4,
		shadowColor: '#23222246',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 8,
	},

	badge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},

	badgeText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '600',
		textTransform: 'capitalize',
	},

	high: { backgroundColor: '#ef4444' },
	medium: { backgroundColor: '#f59e0b' },
	low: { backgroundColor: '#10b981' },

	deadline: {
		fontSize: 12,
		color: '#6b7280',
	},

	meta: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 10,
	},

	image: {
		width: 80,
		height: 80,
		borderRadius: 12,
		marginTop: 10,
	},

	actions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 12,
		gap: 16,
	},

	updateAtText: {
		fontSize: 12,
		color: '#6b7280',
		marginRight: 'auto',
	},

	edit: {
		color: '#3b82f6',
		fontWeight: '600',
	},

	delete: {
		color: '#ef4444',
		fontWeight: '600',
	},
	thumb: {
		width: '100%',
		height: 120,
		borderRadius: 8,
		marginTop: 8,
		backgroundColor: '#eee',
	},
	filterContainer: {
		flexDirection: 'row',
		marginBottom: 12,
		flexWrap: 'wrap',
		alignItems: 'center',
	},
	filterLabel: { marginRight: 4, color: '#555' },
	filter: {
		marginRight: 12,
		color: '#555',
		marginBottom: 4,
		backgroundColor: '#cfd8e270',
		borderRadius: 12,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	activeFilter: {
		marginRight: 12,
		color: '#1E90FF',
		backgroundColor: '#cfd8e27c',
		borderRadius: 12,
		padding: 4,
		paddingHorizontal: 8,
		marginBottom: 4,
		fontWeight: '500',
	},
	addButton: {
		backgroundColor: '#1E90FF',
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
	},
	addButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
	search: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		padding: 10,
		marginBottom: 12,
		fontSize: 16,
	},
	showMoreBtn: {
		marginTop: -10,
		marginLeft: 'auto',
		marginRight: 8,
	},
	showMoreText: {
		fontSize: 10,
		color: '#1E90FF',
	},
});
