import './retrogrid.css';

interface RetroGridProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Rotation angle of the grid in degrees
	 * @default 65
	 */
	angle?: number;
	/**
	 * Grid cell size in pixels
	 * @default 60
	 */
	cellSize?: number;
	/**
	 * Grid opacity value between 0 and 1
	 * @default 0.5
	 */
	opacity?: number;
	/**
	 * Grid line color in light mode
	 * @default "pink"
	 */
	lightLineColor?: string;
	/**
	 * Grid line color in dark mode
	 * @default "pink"
	 */
	darkLineColor?: string;
}
export function RetroGrid({
	angle = 65,
	cellSize = 60,
	opacity = 0.5,
	lightLineColor = 'pink',
	darkLineColor = 'pink',
	...props
}: RetroGridProps) {
	const gridStyles = {
		'--grid-angle': `${angle}deg`,
		'--cell-size': `${cellSize}px`,
		'--opacity': opacity,
		'--light-line': lightLineColor,
		'--dark-line': darkLineColor,
	} as React.CSSProperties;
	return (
		<div
			className='pointer-events-none absolute h-full w-full overflow-hidden opacity-[var(--opacity)] [perspective:200px]'
			style={gridStyles}
			{...props}
		>
			<div className='absolute inset-0 [transform:rotateX(var(--grid-angle))]'>
				<div className='animate-grid [inset:0%_0px] [margin-left:-200%] [height:300vh] [width:600vw] [transform-origin:100%_0_0] [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-size:var(--cell-size)_var(--cell-size)] [background-repeat:repeat] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]' />
			</div>
			<div className='absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black' />
		</div>
	);
}
