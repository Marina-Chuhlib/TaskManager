import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TaskListScreen from '../screens/TaskListScreen';
import AddEditTaskScreen from '../screens/AddEditTaskScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name="TaskList"
				component={TaskListScreen}
				options={{ title: 'Tasks' }}
			/>
			<Stack.Screen
				name="AddEditTask"
				component={AddEditTaskScreen}
				options={({ route }) => ({
					title: route.params?.title || 'Add / Edit Task',
				})}
			/>
		</Stack.Navigator>
	);
};
export default AppNavigator;
