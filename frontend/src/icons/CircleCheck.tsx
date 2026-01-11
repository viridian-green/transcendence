import type { SVGProps } from 'react';

export default function CircleCheck(props: SVGProps<SVGSVGElement>) {
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
				<path d='M21.801 10A10 10 0 1 1 17 3.335'></path>
				<path d='m9 11l3 3L22 4'></path>
			</g>
		</svg>
	);
}
