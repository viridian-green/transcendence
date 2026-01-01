import './PrivacyPolicyAndTerms.css';

export default function PrivacyPolicy() {
	return (
		<div className='policy-and-terms-pages'>
			<article>
				<h1>Privacy Policy</h1>
				<p className='date'>
					<strong>Last updated:</strong> 1.1.2026
				</p>
				<p>
					This online Pong game is an educational project and is not publicly deployed or
					used for commercial purposes.
				</p>
				<h2>Information We Collect</h2>
				<p>The game may store the following information:</p>
				<ul>
					<li>Username</li>
					<li>Profile picture</li>
					<li>Email address</li>
				</ul>
				<h2>How We Use the Information</h2>
				<p>The collected data is used only to:</p>
				<ul>
					<li>Identify players in the game</li>
					<li>Test and develop game features</li>
					<li>Support learning and educational goals</li>
				</ul>
				<h2>Data Sharing</h2>
				<p>We do not sell, share, or distribute personal data to third parties.</p>
				<h2>Data Storage</h2>
				<p>
					All data is stored only for development and testing purposes. Data may be
					deleted or reset at any time. Users should not provide sensitive or real
					personal information.
				</p>
				<h2>Contact</h2>
				<p>If you have questions about this project, you may contact the developer at:</p>
				<p>
					<strong>Email:</strong> retroscendence@mail.com
				</p>
			</article>
		</div>
	);
}
