/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-get-random-values';
import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { AppDispatch, RootState, store } from './src/store/store';
import AppNavigator from './src/navigation/ AppNavigator';
import {
	hydrateTasksFromCache,
	initTasksListener,
} from './src/entities/task/initTasksListener';
import { setOnline } from './src/store/slices/appSlice';
import { setCustomCategories } from './src/store/slices/categoriesSlice';
import { storage, STORAGE_KEYS } from './src/utils/storage';

function CategoriesSync() {
	const dispatch = useDispatch<AppDispatch>();
	const custom = useSelector((s: RootState) => s.categories.custom);
	const [categoriesReady, setCategoriesReady] = useState(false);

	useEffect(() => {
		void storage.get<string[]>(STORAGE_KEYS.CUSTOM_CATEGORIES).then(c => {
			if (c?.length) {
				dispatch(setCustomCategories(c));
			}
			setCategoriesReady(true);
		});
	}, [dispatch]);

	useEffect(() => {
		if (!categoriesReady) return;
		void storage.set(STORAGE_KEYS.CUSTOM_CATEGORIES, custom);
	}, [custom, categoriesReady]);

	return null;
}

function AppContent() {
	const dispatch = useDispatch<AppDispatch>();
	const isDarkMode = useColorScheme() === 'dark';

	useEffect(() => {
		void dispatch(hydrateTasksFromCache());
	}, [dispatch]);

	useEffect(() => {
		const unsubscribe = dispatch(initTasksListener());
		return () => unsubscribe();
	}, [dispatch]);

	useEffect(() => {
		void NetInfo.fetch().then(state => {
			dispatch(setOnline(state.isConnected ?? false));
		});
		return NetInfo.addEventListener(state => {
			dispatch(setOnline(state.isConnected ?? false));
		});
	}, [dispatch]);

	return (
		<View style={styles.container}>
			<CategoriesSync />
			<StatusBar
				barStyle={isDarkMode ? 'light-content' : 'dark-content'}
			/>
			<AppNavigator />
		</View>
	);
}

function App() {
	return (
		<Provider store={store}>
			<SafeAreaProvider>
				<NavigationContainer>
					<AppContent />
				</NavigationContainer>
			</SafeAreaProvider>
		</Provider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default App;
