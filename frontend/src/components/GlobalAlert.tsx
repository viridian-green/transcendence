import PinkButton from './PinkButton';

interface GlobalAlertProps {
	message: string;
	type?: string;
	visible: boolean;
	onClose?: () => void;
	onAccept?: () => void;
	onDecline?: () => void;
	acceptText?: string;
	declineText?: string;
	closeText?: string;
}

const GlobalAlert = ({
	message,
	type,
	visible,
	onClose,
	onAccept,
	onDecline,
	acceptText = 'Accept',
	declineText = 'Decline',
	closeText = 'Close',
}: GlobalAlertProps) => {
	if (!visible) return null;
	let bgColor = 'var(--color-surface)';
	let textColor = 'var(--color-text-primary)';
	if (type === 'received') {
		bgColor = 'var(--color-status-online)';
		textColor = 'var(--color-text-inverse)';
	} else if (type === 'sent') {
		bgColor = 'var(--color-accent-pink)';
		textColor = 'var(--color-text-inverse)';
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
			<div className='bg-surface max-w-[90vw] min-w-[320px] rounded-lg p-6 shadow-lg'>
				<p className='mb-4 text-center text-lg font-semibold'>{message}</p>
				<div className='mt-4 flex w-full justify-center gap-2'>
					{onDecline && (
						<PinkButton text={declineText} className='px-3 py-1' onClick={onDecline} />
					)}
					{onAccept && (
						<PinkButton text={acceptText} className='px-3 py-1' onClick={onAccept} />
					)}
					{onClose && !onAccept && !onDecline && (
						<PinkButton text={closeText} className='px-3 py-1' onClick={onClose} />
					)}
				</div>
			</div>
		</div>
	);
};

export default GlobalAlert;
