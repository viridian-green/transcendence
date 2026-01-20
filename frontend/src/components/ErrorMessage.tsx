import { InfoIcon } from '@/icons';

const ErrorMessage = ({ message }: { message: string }) => (
	<div className='text-accent-pink flex'>
		<InfoIcon className='mr-1 h-4 w-4' />
		<p className='text-accent-pink text-sm'>{message}</p>
	</div>
);

export default ErrorMessage;
