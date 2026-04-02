import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

interface DeadlinePickerProps {
	deadline: string;
	setDeadline: (date: string) => void;
}

export const DeadlinePicker = ({
	deadline,
	setDeadline,
}: DeadlinePickerProps) => {
	const [showCalendar, setShowCalendar] = useState(false);

	const today = new Date();
	const todayString = today.toISOString().split('T')[0];

	return (
		<View style={{ marginBottom: 12 }}>
			<TouchableOpacity
				style={styles.dateInput}
				onPress={() => setShowCalendar(prev => !prev)}
			>
				<Text style={styles.dateText}>
					{deadline
						? format(new Date(deadline), 'dd/ MM/ yyyy')
						: 'Select Deadline'}
				</Text>
				<Text style={{ fontSize: 22 }}>📅</Text>
			</TouchableOpacity>

			{showCalendar && (
				<Calendar
					onDayPress={day => {
						setDeadline(day.dateString);
						setShowCalendar(false);
					}}
					minDate={todayString}
					firstDay={1}
					markedDates={{
						[deadline]: {
							selected: true,
							selectedColor: '#00adf5',
						},
					}}
					theme={{
						todayTextColor: '#00adf5',
						arrowColor: '#00adf5',
					}}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	dateInput: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		padding: 10,
		fontSize: 18,
	},
	dateText: {
		flex: 1,
		fontSize: 18,
	},
});
