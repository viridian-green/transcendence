import { Avatar } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { ProfileCircle, Exit, SettingsIcon, HomeIcon } from '@/icons';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MenuButtonProps {
	onClick: () => void;
	icon: React.ReactNode;
	description: string;
}

const MenuButton = ({ onClick, icon, description }: MenuButtonProps) => {
	return (
		<button
			type='button'
			role='menuitem'
			onClick={onClick}
			className='hover:bg-accent-blue flex items-center justify-between rounded-lg border-0 px-2'
		>
			<p>{description}</p>
			{icon}
		</button>
	);
};

const ProfileCard = () => {
	const { user, signout } = useAuth();
	const navigate = useNavigate();

	const handleSignout = () => {
		signout();
		navigate('/');
	};

	return (
		<div
			className='text-text-secondary border-border bg-surface absolute top-14 right-0 flex min-w-36 flex-col gap-2 rounded-lg border p-4 whitespace-nowrap shadow-sm'
			id='profile-menu'
			role='menu'
			aria-label='User account menu'
		>
			<div>
				<p className='text-accent-pink text-center'>{user?.username}</p>
				<p className='text-text-secondary text-center text-sm'>{user?.email}</p>
			</div>
			<hr className='border-border my-2 w-full' />
			<MenuButton
				onClick={() => navigate('/profile')}
				icon={<ProfileCircle className='stroke-text-primary h-4 w-4' aria-hidden='true' />}
				description='profile'
			/>
			<MenuButton
				onClick={() => navigate('/settings')}
				icon={<SettingsIcon className='stroke-text-primary h-4 w-4' aria-hidden='true' />}
				description='settings'
			/>
			<MenuButton
				onClick={() => navigate('/home')}
				icon={<HomeIcon className='stroke-text-primary h-4 w-4' aria-hidden='true' />}
				description='home'
			/>
			<hr className='border-border my-2 w-full' />
			<MenuButton
				onClick={handleSignout}
				icon={<Exit className='stroke-text-primary h-4 w-4' aria-hidden='true' />}
				description='signout'
			/>
		</div>
	);
};

const DropdownMenuAvatar = () => {
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
				className='flex items-center hover:cursor-pointer'
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

export default DropdownMenuAvatar;
