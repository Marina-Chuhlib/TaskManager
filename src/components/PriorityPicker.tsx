import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Priority } from '../entities/task/types';

export const PriorityPicker: React.FC<{
	priority: Priority;
	setPriority: (p: Priority) => void;
}> = ({ priority, setPriority }) => (
	<View style={styles.container}>
		<Picker
			selectedValue={priority}
			onValueChange={setPriority}
			style={styles.picker}
		>
			{['low', 'medium', 'high'].map(c => (
				<Picker.Item
					key={c}
					label={c.charAt(0).toUpperCase() + c.slice(1)}
					value={c}
				/>
			))}
		</Picker>
	</View>
);

const styles = StyleSheet.create({
	container: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		marginBottom: 12,
		overflow: 'hidden',
	},
	picker: {
		height: 52,
		width: '100%',
	},
});
