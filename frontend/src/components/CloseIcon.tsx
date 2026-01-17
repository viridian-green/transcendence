import type { SVGProps } from 'react';

export default function CloseIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 24 24'
			width='24'
			height='24'
			{...props}
		>
			<g
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2'
			>
				<circle cx='12' cy='12' r='10'></circle>
				<path d='m15 9l-6 6m0-6l6 6'></path>
			</g>
		</svg>
	);
}
