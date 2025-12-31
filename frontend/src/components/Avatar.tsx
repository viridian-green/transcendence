import { useAuth } from '@hooks/useAuth.tsx';

interface AvatarProps {
	url?: string;
	size?: number;
	className?: string;
}

const Avatar = ({ url, size = 48, className }: AvatarProps) => {
	const { user } = useAuth();
	const name = user?.username || '?';
	const alt = `Avatar of ${name}`;
	// const randomuserImage = 'https://randomuser.me/api/portraits/men/75.jpg';
	return (
		<div
			className={`border-accent-pink overflow-hidden rounded-full border-2 hover:opacity-50 ${className}`}
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
