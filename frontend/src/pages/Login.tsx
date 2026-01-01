import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z, ZodError } from 'zod';
import { ExclamationCircleOutline } from '@components/index';
import { useAuth } from '@hooks/useAuth.tsx';

const logInSchema = z.object({
	username: z.string('Invalid username').min(1, 'Username required'),
	password: z.string('Invalid password').min(1, 'Password required'),
});

type LoginUser = z.infer<typeof logInSchema>;

const ErrorMessage = ({ message }: { message: string }) => (
	<div className='text-accent-pink flex'>
		<ExclamationCircleOutline className='mr-1 h-4 w-4' />
		<p className='text-accent-pink text-sm'>{message}</p>
	</div>
);

export default function Login() {
	const [formData, setFormData] = useState({
		username: '',
		password: '',
	});
	const [errors, setErrors] = useState<{
		username?: string;
		password?: string;
		submit?: string;
	}>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (data: LoginUser) => {
		try {
			setIsSubmitting(true);
			setErrors({});

			const validUser: LoginUser = logInSchema.parse(data);

			await login(validUser.username, validUser.password);
			navigate('/home');
		} catch (error) {
			if (error instanceof ZodError) {
				const formattedErrors: Record<string, string> = {};
				error.issues.forEach((err) => {
					if (err.path) {
						formattedErrors[err.path[0] as string] = err.message;
					}
				});
				setErrors(formattedErrors);
			} else {
				if (error instanceof Error) {
					const message = error.message.trimEnd();
					const formattedMessage = message.endsWith('.') ? message.slice(0, -1) : message;
					setErrors({ submit: `${formattedMessage}. Please try again.` });
				} else {
					setErrors({ submit: `Failed to log in. Please try again.` });
				}
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (errors[name as keyof typeof errors]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	};

	return (
		<div className='flex min-h-screen items-center justify-center p-4'>
			<div className='w-full max-w-md'>
				<div>
					<h1 className='text-accent-pink mb-6 text-center text-5xl font-bold'>Login</h1>
				</div>
				<div>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmit(formData);
						}}
						className='space-y-4'
					>
						<div className='flex flex-col space-y-2'>
							<label htmlFor='username' className='text-md font-medium'>
								Username
							</label>
							<input
								id='username'
								name='username'
								type='text'
								value={formData.username}
								onChange={handleChange}
								required
								placeholder='Enter your username'
								className='border-border text-text-secondary rounded-md border-2 p-2 text-sm'
							/>
							{errors.username && <ErrorMessage message={errors.username} />}
						</div>
						<div className='flex flex-col space-y-2'>
							<label htmlFor='password' className='text-md font-medium'>
								Password
							</label>
							<input
								id='password'
								name='password'
								type='password'
								value={formData.password}
								onChange={handleChange}
								required
								placeholder='Enter your password'
								className='border-border text-text-secondary rounded-md border-2 p-2 text-sm'
							/>
							{errors.password && <ErrorMessage message={errors.password} />}
						</div>
						{errors.submit && (
							<p className='text-accent-pink text-center text-sm'>{errors.submit}</p>
						)}
						<button
							type='submit'
							className='border-accent-pink bg-accent-pink text-text-inverse w-full rounded-lg border-2 py-2'
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Logging In...' : 'Log In'}
						</button>
						<div className='text-center text-sm'>
							Don't have an account?{' '}
							<a
								href='/register'
								className='text-accent-purple-dark hover:text-accent-purple-light'
							>
								Register
							</a>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
