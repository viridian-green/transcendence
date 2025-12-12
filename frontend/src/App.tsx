import './App.css';

function App() {
	return (
		<div className='text-center text-2xl font-bold mt-8'>
			Welcome to Transcendence! 🏓
			<div className='mt-8 flex justify-center'>
				<iframe
					src='/game'
					title='Pong Game'
					width='800'
					height='600'
					style={{ border: 'none' }}
				/>
			</div>
		</div>
	);
}

export default App;
