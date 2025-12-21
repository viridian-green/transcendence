import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z, ZodError } from 'zod';

const signupSchema = z
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

type User = z.infer<typeof signupSchema>;

export default function Signup() {
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
	//   const { signIn } = useAuth()

	const handleSubmit = async (data: User) => {
		try {
			setIsSubmitting(true);
			setErrors({});

			// Validate the form data
			const validUser: User = signupSchema.parse(data);
			console.log('Validated Data:', validUser);

			// TODO Attempt sign in
			// await signUp(validUser.email, validUser.password)
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
		<div className='flex min-h-screen items-center justify-center p-4'>
			<div className='w-full max-w-md'>
				<div>
					<h1 className='text-center text-2xl'>Login</h1>
				</div>
				<div>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmit(formData);
						}}
						className='space-y-4'
					>
						<div className='space-y-2'>
							<label htmlFor='email' className='text-sm font-medium'>
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
								className={errors.email ? 'border-red-500' : ''}
							/>
							{errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
						</div>
						<div className='space-y-2'>
							<label htmlFor='username' className='text-sm font-medium'>
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
								className={errors.email ? 'border-red-500' : ''}
							/>
							{errors.username && (
								<p className='text-sm text-red-500'>{errors.username}</p>
							)}
						</div>
						<div className='space-y-2'>
							<label htmlFor='password' className='text-sm font-medium'>
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
								className={errors.password ? 'border-red-500' : ''}
							/>
							{errors.password && (
								<p className='text-sm text-red-500'>{errors.password}</p>
							)}
						</div>
						<div className='space-y-2'>
							<label htmlFor='confirmPassword' className='text-sm font-medium'>
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
								className={errors.confirmPassword ? 'border-red-500' : ''}
							/>
							{errors.confirmPassword && (
								<p className='text-sm text-red-500'>{errors.confirmPassword}</p>
							)}
						</div>
						{errors.submit && (
							<p className='text-center text-sm text-red-500'>{errors.submit}</p>
						)}
						<button type='submit' className='w-full' disabled={isSubmitting}>
							{isSubmitting ? 'Creating account...' : 'Sign Up'}
						</button>
						<div className='text-center text-sm'>
							Already have an account?{' '}
							<a href='/login' className='text-purple-600 hover:text-purple-500'>
								Log in
							</a>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
