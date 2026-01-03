import type { ReactNode } from 'react';
import './LegalText.css';

export default function LegalText({ children }: { children: ReactNode }) {
	return (
		<div className='legal-text-wrapper'>
			<article className='legal-text'>{children}</article>
		</div>
	);
}
