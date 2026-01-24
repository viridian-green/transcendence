import type { ReactNode } from 'react';
import './LegalText.css';
import { useNavigate } from 'react-router-dom';
import CloseIcon from './CloseIcon';

export default function LegalText({ title, children }: { title: string; children: ReactNode }) {
	const navigate = useNavigate();

	return (
		<div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/20 p-8 shadow-lg'>
			<div className='legal-text'>
				<div className='legal-text-header'>
					<h1>{title}</h1>
					<button
						className='hover:cursor-pointer'
						type='button'
						onClick={() => navigate(-1)}
					>
						{<CloseIcon />}
					</button>
				</div>
				<article className='flex-1 overflow-y-auto'>{children}</article>
			</div>
		</div>
	);
}
