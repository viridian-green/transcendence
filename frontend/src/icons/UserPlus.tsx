import type { SVGProps } from 'react';

export function UserPlus(props: SVGProps<SVGSVGElement>) {
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
				<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'></path>
				<circle cx='9' cy='7' r='4'></circle>
				<path d='M19 8v6m3-3h-6'></path>
			</g>
		</svg>
	);
}
