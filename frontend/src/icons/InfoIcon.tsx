import type { SVGProps } from 'react';

export default function InfoIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 24 24'
			width='1em'
			height='1em'
			{...props}
		>
			<path
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2'
				d='M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0'
			></path>
		</svg>
	);
}
