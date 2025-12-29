import { Avatar, Exit, ProfileCircle } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const ProfileCard = () => {
	const { user, signout } = useAuth();
	return (
		<div className='absolute top-14 right-0 flex flex-col items-start rounded-lg bg-slate-900 p-4 whitespace-nowrap text-slate-300 shadow-xs shadow-slate-700'>
			<p>{user?.username}</p>
			<div>
				<p className='inline-block'>view profile</p>
				<ProfileCircle className='ml-2 inline-block h-4 w-4 stroke-slate-300' />
			</div>
			<hr className='my-2 w-full border-slate-700' />
			<div onClick={() => signout()} className='cursor-pointer'>
				<p className='inline-block'>signout</p>
				<Exit className='ml-2 inline-block h-4 w-4 stroke-slate-300' />
			</div>
		</div>
	);
};

const TopRightAvatar = () => {
	const [open, setOpen] = useState(false);
	return (
		<div onClick={() => setOpen(!open)} className='relative'>
			<Avatar />
			{open && <ProfileCard />}
		</div>
	);
};

export default TopRightAvatar;
