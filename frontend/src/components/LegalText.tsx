import type { ReactNode } from 'react';
import './LegalText.css';
import { useNavigate } from 'react-router-dom';
import CloseIcon from './CloseIcon';

export default function LegalText({ title, children }: { title: string; children: ReactNode }) {
	const navigate = useNavigate();

	return (
		<div className='legal-text-wrapper'>
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
				<article>{children}</article>
			</div>
		</div>
	);
}
