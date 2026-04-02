export type DeadlinePreset = 'all' | 'today' | 'week' | 'overdue';

const parseDay = (iso: string): number => {
	const [y, m, d] = iso.split('T')[0].split('-').map(Number);
	return new Date(y, m - 1, d).getTime();
};

const startOfToday = (): number => {
	const n = new Date();
	return new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
};

export const matchesDeadlinePreset = (
	deadlineIso: string,
	preset: DeadlinePreset
): boolean => {
	if (preset === 'all') return true;
	const day = parseDay(deadlineIso);
	const today = startOfToday();
	const oneDay = 86400000;

	if (preset === 'overdue') return day < today;

	if (preset === 'today') return day >= today && day < today + oneDay;

	if (preset === 'week') {
		const weekEnd = today + 7 * oneDay;
		return day >= today && day < weekEnd;
	}

	return true;
};
