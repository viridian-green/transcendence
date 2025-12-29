import { useAuth } from '@hooks/useAuth.tsx';

interface AvatarProps {
	url?: string;
	size?: number;
}

const Avatar = ({ url, size = 48 }: AvatarProps) => {
	const { user } = useAuth();
	const name = user?.username || '?';
	const alt = `Avatar of ${name}`;
	// const randomuserImage = 'https://randomuser.me/api/portraits/men/75.jpg';
	return (
		<div
			className='overflow-hidden rounded-full border-2 border-pink-500 hover:opacity-50'
			style={{ width: size, height: size }}
		>
			<img
				src={
					url
						? url
						: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size * 2}`
				}
				alt={alt}
			/>
		</div>
	);
};

export default Avatar;
