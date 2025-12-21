import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z, ZodError } from 'zod';
import { ExclamationCircleOutline } from '@components/index';

const logInSchema = z.object({
	email: z.email('Invalid email address'),
	password: z.string().min(1, 'Password required'),
});

type User = z.infer<typeof logInSchema>;

const ErrorMessage = ({ message }: { message: string }) => (
	<div className='flex text-pink-600'>
		<ExclamationCircleOutline className='mr-1 h-4 w-4' />
		<p className='text-sm text-pink-600'>{message}</p>
	</div>
);

export default function Login() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [errors, setErrors] = useState<{
		email?: string;
		password?: string;
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
			const validUser: User = logInSchema.parse(data);
			console.log('Validated Data:', validUser);

			// TODO Attempt sign in
			// await signIn(validUser.email, validUser.password)
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
				// TODO maybe handle different error types e.g. invalid email or wrong password
				setErrors({ submit: 'Failed to sign in. Please try again.' });
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
					<h1 className='mb-6 text-center text-5xl font-bold text-pink-600'>Login</h1>
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
						{errors.submit && (
							<p className='text-center text-sm text-pink-600'>{errors.submit}</p>
						)}
						<button
							type='submit'
							className='w-full rounded-lg border-2 border-pink-600 bg-pink-600 py-2 text-black'
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Logging In...' : 'Log In'}
						</button>
						<div className='text-center text-sm text-slate-300'>
							Don't have an account?{' '}
							<a href='/signup' className='text-purple-600 hover:text-purple-500'>
								Register
							</a>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
