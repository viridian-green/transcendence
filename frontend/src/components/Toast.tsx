import { useEffect, useState } from 'react';
import { SuccessIcon, FailureIcon, WarningIcon, CloseIcon } from '@/icons';
import './Toast.css';

type ToastType = 'success' | 'failure' | 'warning';

type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface ToastProps {
	message: string;
	type: ToastType;
	onClose: () => void;
	position?: ToastPosition;
	duration?: number;
}

const EXIT_ANIMATION_DURATION = 300; // ms

const Toast = ({ message, type, position = 'top-right', onClose, duration = 3000 }: ToastProps) => {
	const [isClosing, setIsClosing] = useState(false);

	const iconMap = {
		success: <SuccessIcon />,
		failure: <FailureIcon />,
		warning: <WarningIcon />,
	};

	// Auto dismiss
	useEffect(() => {
		const timer = setTimeout(() => setIsClosing(true), duration);
		return () => clearTimeout(timer);
	}, [duration]);

	// Unmount AFTER exit animation
	useEffect(() => {
		if (!isClosing) return;

		const timer = setTimeout(onClose, EXIT_ANIMATION_DURATION);
		return () => clearTimeout(timer);
	}, [isClosing, onClose]);

	const handleClose = () => {
		setIsClosing(true);
	};

	return (
		<div
			role='alert'
			className={`toast toast-${position} ${isClosing ? 'toast-exit' : 'toast-enter'}`}
		>
			<div className='toast-content'>
				<div className='toast-icon'>{iconMap[type]}</div>
				<p className='toast-message'>{message}</p>
			</div>

			<button className='toast-close' onClick={handleClose}>
				<CloseIcon />
			</button>
		</div>
	);
};

export default Toast;
