import React from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
} from 'react-native';

type FilterGroupProps<T> = {
	options: T[];
	active: T;
	onSelect: (value: T) => void;
	formatLabel?: (value: T) => string;
};

export const FilterGroup = <T extends string>({
	options,
	active,
	onSelect,
	formatLabel,
}: FilterGroupProps<T>) => {
	return (
		<View style={styles.filterContainer}>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{
					alignItems: 'center',
				}}
			>
				{options.map(option => (
					<TouchableOpacity
						key={option}
						onPress={() => onSelect(option)}
					>
						<Text
							style={
								active === option
									? styles.activeFilter
									: styles.filter
							}
						>
							{formatLabel
								? formatLabel(option)
								: option.toUpperCase()}
						</Text>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	filterContainer: {
		flexDirection: 'row',
		marginBottom: 12,
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
});
