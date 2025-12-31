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
			className='bg-surface shadow-elevated absolute top-14 right-0 flex flex-col rounded-lg p-4 whitespace-nowrap shadow-sm'
			id='profile-menu'
			role='menu'
			aria-label='User account menu'
		>
			<p className='text-accent-pink text-center'>{user?.username}</p>
			<p className='text-text-secondary mb-2 text-center text-sm'>{user?.email}</p>
			<button
				type='button'
				role='menuitem'
				onClick={() => navigate('/profile')}
				className='hover:bg-accent-blue cursor-pointer rounded-lg border-0 px-2'
			>
				<p className='inline-block'>view profile</p>
				<ProfileCircle
					className='stroke-text-primary ml-2 inline-block h-4 w-4'
					aria-hidden='true'
				/>
			</button>
			<hr className='border-border my-2 w-full' />
			<button
				type='button'
				role='menuitem'
				onClick={handleSignout}
				className='hover:bg-accent-blue cursor-pointer rounded-lg border-0 px-2'
			>
				<p className='inline-block'>signout</p>
				<Exit
					className='stroke-text-primary ml-2 inline-block h-4 w-4'
					aria-hidden='true'
				/>
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
			function handleClickOutside(event: MouseEvent) {
				if (ref.current && !ref.current.contains(event.target as Node)) {
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
