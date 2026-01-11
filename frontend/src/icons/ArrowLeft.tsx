import type { SVGProps } from 'react';

export default function ArrowLeft(props: SVGProps<SVGSVGElement>) {
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
				d='m12 19l-7-7l7-7m7 7H5'
			></path>
		</svg>
	);
}
