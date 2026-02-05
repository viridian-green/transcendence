export const authErrorMapper = (code: number) => {
	switch (code) {
		case 400:
			return 'Invalid request. Please check your input.';
		case 401:
			return 'Unauthorized. Please check your credentials.';
		case 403:
			return 'Forbidden. You do not have permission to access this resource.';
		case 404:
			return 'User not found. Please check your credentials.';
		case 409:
			return 'User already exists. Please use a different email or username.';
		case 419:
			return 'User is already online. Please log out from other devices.';
		case 500:
			return 'Server error. Please try again later.';
		default:
			return 'An unknown error occurred. Please try again.';
	}
};
