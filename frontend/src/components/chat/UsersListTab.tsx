import UsersList from './OnlineUsersList';
import type { User } from '@/shared.types';

interface UsersListTabProps {
	users: User[];
	friends: User[];
	loading: boolean;
	error: string | null;
	onUserClick: (user: User) => void;
	currentUserId: string | undefined;
}

const UsersListTab = ({
	users,
	friends,
	loading,
	error,
	onUserClick,
	currentUserId,
}: UsersListTabProps) => {
	if (!currentUserId) {
		return <div>Please log in to see online users.</div>;
	}
	return (
		<UsersList
			users={users}
			friends={friends}
			loading={loading}
			error={error}
			onUserClick={onUserClick}
			currentUserId={currentUserId}
		/>
	);
};

export default UsersListTab;
