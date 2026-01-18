import type { SVGProps } from 'react';

export function Lock(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 24 24'
			width='1em'
			height='1em'
			{...props}
		>
			<g
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2'
			>
				<circle cx='12' cy='16' r='1'></circle>
				<rect width='18' height='12' x='3' y='10' rx='2'></rect>
				<path d='M7 10V7a5 5 0 0 1 10 0v3'></path>
			</g>
		</svg>
	);
}
