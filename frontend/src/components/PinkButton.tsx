import classNames from 'classnames';

interface PinkButtonProps {
	text: string;
	onClick: () => void;
	className?: string;
}

const PinkButton = ({ text, onClick, className }: PinkButtonProps) => {
	return (
		<button
			className={classNames(
				'border-accent-pink hover:bg-accent-pink hover:text-text-inverse w-xs rounded-lg border-2 px-4 py-2 sm:px-6 sm:py-4',
				className,
			)}
			onClick={onClick}
		>
			<p>{text}</p>
		</button>
	);
};

export default PinkButton;
