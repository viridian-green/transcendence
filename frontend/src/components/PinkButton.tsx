interface PinkButtonProps {
	text: string;
	onClick: () => void;
}

const PinkButton = ({ text, onClick }: PinkButtonProps) => {
	return (
		<button
			className='border-accent-pink hover:bg-accent-pink hover:text-text-inverse w-xs rounded-lg border-2 px-6 py-4 transition-colors'
			onClick={onClick}
		>
			<p>{text}</p>
		</button>
	);
};

export default PinkButton;
