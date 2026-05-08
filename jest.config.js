module.exports = {
	preset: 'react-native',
	watchman: false,
	transformIgnorePatterns: [
		'node_modules/(?!(immer|@reduxjs/toolkit|@react-native|react-native)/)',
	],
};
