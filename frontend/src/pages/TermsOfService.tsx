import LegalText from '@components/LegalText';

export default function TermsOfService() {
	return (
		<LegalText>
			<h1>Terms of Service</h1>
			<p className='date'>
				<strong>Last updated:</strong> 1.1.2026
			</p>
			<p>
				This online Pong game <strong>Retroscendence</strong> is an educational project
				created for learning and development purposes only as part of the{' '}
				<a href='https://www.42network.org/'>42 curriculum</a>. The Game is not publicly
				deployed and is not intended for commercial use.
			</p>
			<h2>Use of the Game</h2>
			<p>
				The Game is provided on an <strong>as-is</strong> basis for educational and testing
				purposes.
			</p>
			<ul>
				<li>The Game may change, reset, or become unavailable at any time.</li>
				<li>No guarantee is provided regarding uptime or data persistence.</li>
				<li>You agree to use the Game only for lawful and educational purposes.</li>
			</ul>
			<h2>User Accounts</h2>
			<p>
				The Game may allow user accounts that include a username, profile picture, and email
				address.
			</p>
			<ul>
				<li>You are responsible for the information you provide.</li>
				<li>Do not submit sensitive or real personal information.</li>
				<li>Accounts and data may be modified or deleted at any time.</li>
			</ul>
			<h2>Privacy</h2>
			<p>
				Any personal data used in the Game is handled according to the{' '}
				<a href='/privacy-policy'>Privacy Policy</a>.
			</p>
			<h2>Limitation of Liability</h2>
			<p>
				The developers are not responsible for any data loss, errors, or damages resulting
				from the use of this Game.
			</p>
			<h2>Changes to These Terms</h2>
			<p>These Terms of Service may be updated at any time as the project evolves.</p>
			<h2>Contact</h2>
			<p>If you have questions about these Terms, you may contact us at:</p>
			<p>
				<strong>Email: </strong>
				<a href='mailto:retroscendence@mail.com'>retroscendence@mail.com</a>
			</p>
		</LegalText>
	);
}
