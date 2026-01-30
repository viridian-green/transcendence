import { useState, useEffect } from 'react';

export function useLocalStorageState<T>(
	key: string,
	initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [state, setState] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error: unknown) {
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(state));
		} catch (error: unknown) {
			// Ignore write errors
		}
	}, [key, state]);

	return [state, setState];
}
