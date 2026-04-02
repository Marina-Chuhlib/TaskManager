import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BUILT_IN_CATEGORIES } from '../entities/task/types';

export const CategoryPicker: React.FC<{
	category: string;
	setCategory: (c: string) => void;
	customCategories: string[];
	onAddCustomCategory: (name: string) => void;
}> = ({ category, setCategory, customCategories, onAddCustomCategory }) => {
	const [newName, setNewName] = useState('');

	const allOptions = useMemo(() => {
		const merged = [...BUILT_IN_CATEGORIES, ...customCategories];
		return Array.from(new Set(merged));
	}, [customCategories]);

	return (
		<View style={styles.wrap}>
			<View style={styles.container}>
				<Picker
					selectedValue={category}
					onValueChange={setCategory}
					style={styles.picker}
				>
					{allOptions.map(c => (
						<Picker.Item key={c} label={c} value={c} />
					))}
				</Picker>
			</View>

			<View style={styles.addRow}>
				<TextInput
					style={styles.input}
					placeholder="New category"
					value={newName}
					onChangeText={setNewName}
				/>
				<Pressable
					style={({ pressed }) => [
						styles.addBtn,
						pressed && styles.addBtnPressed,
					]}
					onPress={() => {
						const t = newName.trim();
						if (!t) return;
						onAddCustomCategory(t);
						setCategory(t);
						setNewName('');
					}}
				>
					<Text style={styles.addBtnText}>Add</Text>
				</Pressable>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrap: {
		marginBottom: 12,
	},
	container: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		marginBottom: 12,
		overflow: 'hidden',
	},
	picker: {
		width: '100%',
		borderWidth: 1,
		borderColor: 'red',
		borderRadius: 8,
		overflow: 'hidden',
		height: 52,
	},
	addRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
		gap: 8,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		paddingHorizontal: 12,
		height: 42,
		fontSize: 16,
	},
	addBtn: {
		backgroundColor: '#2685ea',
		paddingHorizontal: 14,
		height: 42,
		borderRadius: 8,
		justifyContent: 'center',
	},
	addBtnPressed: { opacity: 0.75 },
	addBtnText: { color: '#fff', fontWeight: '600' },
});
