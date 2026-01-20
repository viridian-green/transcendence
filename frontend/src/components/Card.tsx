const Card = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className='text-text-secondary border-border bg-surface rounded-2xl border p-8'>
			{children}
		</div>
	);
};

const CardTitle = ({ children }: { children: React.ReactNode }) => {
	return <h2 className='text-accent-pink mb-6'>{children}</h2>;
};

export { Card, CardTitle };
