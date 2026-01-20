import { Card, CardTitle } from '@/components';

export function StatsCard() {
	return (
		<Card>
			<CardTitle>Stats</CardTitle>
			<div className='flex flex-col space-y-2'>Wins</div>
			<div className='flex flex-col space-y-2'>Losses</div>
			<div className='flex flex-col space-y-2'>Friends</div>
		</Card>
	);
}
