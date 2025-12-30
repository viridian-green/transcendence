import { Avatar, Exit, ProfileCircle } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileCard = () => {
	const { user, signout } = useAuth();
	const navigate = useNavigate();

	const handleSignout = () => {
		signout();
		navigate('/');
	};

	return (
		<div
			className='absolute top-14 right-0 flex flex-col rounded-lg bg-slate-900 p-4 whitespace-nowrap text-slate-300 shadow-xs shadow-slate-700'
			id='profile-menu'
			role='menu'
			aria-label='User account menu'
		>
			<p className='text-center text-pink-600'>{user?.username}</p>
			<p className='mb-2 text-center text-sm text-pink-600'>{user?.email}</p>
			<button
				type='button'
				role='menuitem'
				onClick={() => navigate('/profile')}
				className='cursor-pointer rounded-lg border-0 px-2 hover:bg-[#0c8ce9]'
			>
				<p className='inline-block'>view profile</p>
				<ProfileCircle
					className='ml-2 inline-block h-4 w-4 stroke-slate-300'
					aria-hidden='true'
				/>
			</button>
			<hr className='my-2 w-full border-slate-700' />
			<button
				type='button'
				role='menuitem'
				onClick={handleSignout}
				className='cursor-pointer rounded-lg border-0 px-2 hover:bg-[#0c8ce9]'
			>
				<p className='inline-block'>signout</p>
				<Exit className='ml-2 inline-block h-4 w-4 stroke-slate-300' aria-hidden='true' />
			</button>
		</div>
	);
};

const TopRightAvatar = () => {
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	useOutsideAlerter(wrapperRef);
	function useOutsideAlerter(ref: React.RefObject<HTMLDivElement | null>) {
		useEffect(() => {
			/**
			 * Alert if clicked on outside of element
			 */
			function handleClickOutside(event) {
				if (ref.current && !ref.current.contains(event.target)) {
					setOpen(false);
				}
			}
			// Bind the event listener
			document.addEventListener('mousedown', handleClickOutside);
			return () => {
				// Unbind the event listener on clean up
				document.removeEventListener('mousedown', handleClickOutside);
			};
		}, [ref]);
	}

	return (
		<div className='relative' ref={wrapperRef}>
			<button
				type='button'
				onClick={() => setOpen(!open)}
				className='cursor-pointer'
				aria-haspopup='menu'
				aria-expanded={open}
				aria-controls='profile-menu'
				aria-label='Open user menu'
			>
				<Avatar />
			</button>
			{open && <ProfileCard />}
		</div>
	);
};

export default TopRightAvatar;
