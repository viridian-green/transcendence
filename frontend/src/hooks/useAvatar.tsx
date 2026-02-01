export const getAvatar = async (fileName: string, cacheBust?: string) => {
	// Add cache-busting parameter to prevent browser caching
	const url = cacheBust
		? `/api/avatars/${fileName}?t=${cacheBust}`
		: `/api/avatars/${fileName}?t=${Date.now()}`;

	const res = await fetch(url, {
		method: 'GET',
		credentials: 'include',
		cache: 'no-store', // Prevent caching
	});
	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.error || 'Failed to fetch avatar');
	}
	const avatar = await res.blob();
	return URL.createObjectURL(avatar);
};
