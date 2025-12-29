export default function PinkSphere() {
	return (
		<div className='size-full' data-name='sphere'>
			<svg
				className='block size-full'
				fill='none'
				preserveAspectRatio='none'
				viewBox='0 0 275.374 250.346'
			>
				<g clipPath='url(#clip0_pink)' id='sphere'>
					<ellipse
						cx='137.687'
						cy='125.173'
						fill='url(#paint0_radial_pink)'
						id='Ellipse 3'
						rx='137.687'
						ry='125.173'
					/>
				</g>
				<defs>
					<radialGradient
						cx='0'
						cy='0'
						gradientTransform='matrix(119.201 181.385 -199.519 108.367 76.4929 60.2685)'
						gradientUnits='userSpaceOnUse'
						id='paint0_radial_pink'
						r='1'
					>
						<stop stopColor='#FF69B4' />
						<stop offset='0.604593' stopColor='#EC4899' />
						<stop offset='0.796202' stopColor='#DB2777' />
						<stop offset='1' stopColor='#BE185D' />
					</radialGradient>
					<clipPath id='clip0_pink'>
						<rect fill='white' height='250.346' width='275.374' />
					</clipPath>
				</defs>
			</svg>
		</div>
	);
}
