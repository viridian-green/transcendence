import { Avatar, Exit, ProfileCircle } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileCard = () => {
	const { user, signout } = useAuth();
	const navigate = useNavigate();
	return (
		<div className='absolute top-14 right-0 flex flex-col rounded-lg bg-slate-900 p-4 whitespace-nowrap text-slate-300 shadow-xs shadow-slate-700'>
			<p className='text-center text-pink-600'>{user?.username}</p>
			<p className='mb-2 text-center text-sm text-pink-600'>{user?.email}</p>
			<div
				onClick={() => navigate('/profile')}
				className='cursor-pointer rounded-lg border-0 px-2 hover:bg-[#0c8ce9]'
			>
				<p className='inline-block'>view profile</p>
				<ProfileCircle className='ml-2 inline-block h-4 w-4 stroke-slate-300' />
			</div>
			<hr className='my-2 w-full border-slate-700' />
			<div
				onClick={() => signout()}
				className='cursor-pointer rounded-lg border-0 px-2 hover:bg-[#0c8ce9]'
			>
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
			<Avatar className='cursor-pointer' />
			{open && <ProfileCard />}
		</div>
	);
};

export default TopRightAvatar;
