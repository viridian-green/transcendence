import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z, ZodError } from 'zod';
import { ExclamationCircleOutline } from '@components/index';
import { useAuth } from '@hooks/useAuth.tsx';

const registrationSchema = z
	.object({
		email: z.email('Invalid email address'),
		username: z
			.string()
			.min(1, 'Username is required')
			.max(15, 'Username must be at most 15 characters'),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.max(15, 'Password must be at most 15 characters')
			.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
			.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
			.regex(/[0-9]/, 'Password must contain at least one number')
			.regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

type RegistrationUser = z.infer<typeof registrationSchema>;

const ErrorMessage = ({ message }: { message: string }) => (
	<div className='text-accent-pink flex'>
		<ExclamationCircleOutline className='mr-1 h-4 w-4' />
		<p className='text-accent-pink text-sm'>{message}</p>
	</div>
);

export default function Registration() {
	const [formData, setFormData] = useState({
		email: '',
		username: '',
		password: '',
		confirmPassword: '',
	});
	const [errors, setErrors] = useState<{
		email?: string;
		username?: string;
		password?: string;
		confirmPassword?: string;
		submit?: string;
	}>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();
	const { register } = useAuth();

	const handleSubmit = async (data: RegistrationUser) => {
		try {
			setIsSubmitting(true);
			setErrors({});

			const termsAccepted = (document.getElementById('terms') as HTMLInputElement)?.checked; // Replace with actual checkbox state
			if (!termsAccepted) {
				setErrors({ submit: 'You must agree to the Terms and Policy.' });
				return;
			}

			const validUser: RegistrationUser = registrationSchema.parse(data);

			await register(validUser.email, validUser.username, validUser.password);
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
					setErrors({ submit: `Failed to create account. Please try again.` });
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
					<h1 className='text-accent-pink mb-6 text-center text-5xl font-bold'>
						Register
					</h1>
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
							<label htmlFor='email' className='text-md font-medium'>
								Email
							</label>
							<input
								id='email'
								name='email'
								type='email'
								value={formData.email}
								onChange={handleChange}
								required
								placeholder='Enter your email'
								className='border-border text-text-secondary rounded-md border-2 p-2 text-sm'
							/>
							{errors.email && <ErrorMessage message={errors.email} />}
						</div>
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
						<div className='flex flex-col space-y-2'>
							<label htmlFor='confirmPassword' className='text-md font-medium'>
								Confirm Password
							</label>
							<input
								id='confirmPassword'
								name='confirmPassword'
								type='password'
								value={formData.confirmPassword}
								onChange={handleChange}
								required
								placeholder='Confirm your password'
								className='border-border text-text-secondary rounded-md border-2 p-2 text-sm'
							/>
							{errors.confirmPassword && (
								<ErrorMessage message={errors.confirmPassword} />
							)}
						</div>
						<div>
							<input type='checkbox' id='terms' name='terms' value='terms' />
							<label htmlFor='terms' className='ml-2 text-sm'>
								I agree to the{' '}
								<a
									href='/terms-of-service'
									className='text-accent-purple-dark hover:text-accent-purple-light'
								>
									Terms
								</a>
								{' & '}
								<a
									href='/privacy-policy'
									className='text-accent-purple-dark hover:text-accent-purple-light'
								>
									Policy
								</a>
							</label>
						</div>
						{errors.submit && <ErrorMessage message={errors.submit} />}
						<button
							type='submit'
							className='border-accent-pink bg-accent-pink text-text-inverse w-full rounded-lg border-2 py-2'
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Creating account...' : 'Create Account'}
						</button>
						<div className='text-center text-sm'>
							Already have an account?{' '}
							<a
								href='/login'
								className='text-accent-purple-dark hover:text-accent-purple-light'
							>
								Login
							</a>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
