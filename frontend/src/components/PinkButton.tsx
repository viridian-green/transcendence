interface PinkButtonProps {
	text: string;
	onClick: () => void;
}

const PinkButton = ({ text, onClick }: PinkButtonProps) => {
	return (
		<button
			className='w-xs rounded-lg border-2 border-pink-600 px-6 py-4 transition-colors hover:bg-pink-600 hover:text-black'
			onClick={onClick}
		>
			<p>{text}</p>
		</button>
	);
};

export default PinkButton;
