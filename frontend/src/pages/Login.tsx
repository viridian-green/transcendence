import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z, ZodError } from 'zod';
import { ErrorMessage } from '@components/index';
import { useAuth } from '@hooks/useAuth.tsx';
import { Eye } from '@/icons/Eye';
import { EyeOff } from '@/icons/EyeOff';

const logInSchema = z.object({
	email: z.email('Invalid email address').min(1, 'Email required'),
	password: z.string('Invalid password').min(1, 'Password required'),
});

type LoginUser = z.infer<typeof logInSchema>;

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
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (data: LoginUser) => {
		try {
			setIsSubmitting(true);
			setErrors({});

			const validUser: LoginUser = logInSchema.parse(data);

			await login(validUser.email, validUser.password);
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
							<label htmlFor='email' className='text-md font-medium'>
								Email
							</label>
							<input
								id='email'
								name='email'
								type='text'
								value={formData.email}
								onChange={handleChange}
								required
								placeholder='Enter your email'
								className='border-border text-text-secondary rounded-md border-2 p-2 text-sm'
							/>
							{errors.email && <ErrorMessage message={errors.email} />}
						</div>
						<div className='relative flex flex-col space-y-2'>
							<label htmlFor='password' className='text-md font-medium'>
								Password
							</label>
							<input
								id='password'
								name='password'
								type={showPassword ? 'text' : 'password'}
								value={formData.password}
								onChange={handleChange}
								required
								placeholder='Enter your password'
								className='border-border text-text-secondary rounded-md border-2 p-2 text-sm'
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='text-text-muted absolute top-2/3 right-3 -translate-y-1/2 hover:text-(--color-text-primary)'
							>
								{showPassword ? (
									<EyeOff className='h-4 w-4' />
								) : (
									<Eye className='h-4 w-4' />
								)}
							</button>
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
