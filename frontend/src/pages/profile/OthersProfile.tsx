import { ProfileCard } from './ProfileCard';
import { useFriendProfile } from '@/hooks/useFriendProfile';
import { useFriendsWithStatus } from '@/hooks/useFriendsPresence';
import { useParams } from 'react-router-dom';
import NotFound from '../NotFound';
import Loading from '../Loading';
import { OthersFriendsCard } from './OthersFriendsCard';

const OthersProfile = () => {
	const friendId = useParams().userId;
	const { friend, loading: friendLoading, error: friendError } = useFriendProfile(friendId);
	const { friends, loading: friendsWithStatusLoading } = useFriendsWithStatus(Number(friendId));

	if (friendError) {
		return <NotFound />;
	}
	if (friendLoading || friendsWithStatusLoading) {
		return <Loading />;
	}
	if (!friend) {
		return null;
	}

	console.log('Rendering OthersProfile for friend:', friend);

	return (
		<div className='flex flex-1'>
			<main className='mx-auto my-auto max-w-6xl flex-1 overflow-y-auto px-6 py-8'>
				<div className='grid gap-6 md:grid-cols-2'>
					<ProfileCard profile={friend} avatar={friend.avatar ?? null} />
					<OthersFriendsCard friends={friends} />
				</div>
			</main>
		</div>
	);
};

export default OthersProfile;
