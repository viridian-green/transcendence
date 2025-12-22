import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z, ZodError } from 'zod';
import { ExclamationCircleOutline } from '@components/index';

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

type User = z.infer<typeof registrationSchema>;

const ErrorMessage = ({ message }: { message: string }) => (
	<div className='flex text-pink-600'>
		<ExclamationCircleOutline className='mr-1 h-4 w-4' />
		<p className='text-sm text-pink-600'>{message}</p>
	</div>
);

export default function Registration() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		username: '',
		confirmPassword: '',
	});
	const [errors, setErrors] = useState<{
		email?: string;
		password?: string;
		username?: string;
		confirmPassword?: string;
		submit?: string;
	}>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();
	//   const { register } = useAuth()

	const handleSubmit = async (data: User) => {
		try {
			setIsSubmitting(true);
			setErrors({});

			const termsAccepted = (document.getElementById('terms') as HTMLInputElement)?.checked; // Replace with actual checkbox state
			if (!termsAccepted) {
				setErrors({ submit: 'You must agree to the Terms and Policy.' });
				return;
			}

			// Validate the form data
			const validUser: User = registrationSchema.parse(data);
			// TODO Remove console log
			console.log('Validated Data:', validUser);

			// TODO Attempt register
			// await register(validUser.email, validUser.password, validUser.username)
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
				// TODO maybe handle different error types e.g. username taken, email taken, etc.
				setErrors({ submit: 'Failed to create account. Please try again.' });
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
		<div className='flex min-h-screen items-center justify-center p-4 text-white'>
			<div className='w-full max-w-md'>
				<div>
					<h1 className='mb-6 text-center text-5xl font-bold text-pink-600'>Register</h1>
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
							<label htmlFor='email' className='text-md font-medium text-slate-300'>
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
								className='rounded-md border-2 border-slate-700 p-2 text-sm'
							/>
							{errors.email && <ErrorMessage message={errors.email} />}
						</div>
						<div className='flex flex-col space-y-2'>
							<label
								htmlFor='username'
								className='text-md font-medium text-slate-300'
							>
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
								className='rounded-md border-2 border-slate-700 p-2 text-sm'
							/>
							{errors.username && <ErrorMessage message={errors.username} />}
						</div>
						<div className='flex flex-col space-y-2'>
							<label
								htmlFor='password'
								className='text-md font-medium text-slate-300'
							>
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
								className='rounded-md border-2 border-slate-700 p-2 text-sm'
							/>
							{errors.password && <ErrorMessage message={errors.password} />}
						</div>
						<div className='flex flex-col space-y-2'>
							<label
								htmlFor='confirmPassword'
								className='text-md font-medium text-slate-300'
							>
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
								className='rounded-md border-2 border-slate-700 p-2 text-sm'
							/>
							{errors.confirmPassword && (
								<ErrorMessage message={errors.confirmPassword} />
							)}
						</div>
						<div>
							<input type='checkbox' id='terms' name='terms' value='terms' />
							<label htmlFor='terms' className='ml-2 text-sm text-slate-300'>
								I agree to the{' '}
								<a href='/terms' className='text-purple-600 hover:text-purple-500'>
									Terms and Policy
								</a>
							</label>
						</div>
						{errors.submit && <ErrorMessage message={errors.submit} />}
						<button
							type='submit'
							className='w-full rounded-lg border-2 border-pink-600 bg-pink-600 py-2 text-black'
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Creating account...' : 'Create Account'}
						</button>
						<div className='text-center text-sm text-slate-300'>
							Already have an account?{' '}
							<a href='/login' className='text-purple-600 hover:text-purple-500'>
								Login
							</a>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
