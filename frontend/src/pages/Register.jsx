import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../utils/api';
import useAuthStore from '../store/authStore';
import ErrorAlert from '../components/ErrorAlert';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import Logo from '../components/Logo';

function Register() {
  const { goBack } = useSmartNavigation('/');
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      const { confirmPassword, ...registerData } = data;
      const response = await authAPI.register(registerData);
      // Token is now in httpOnly cookie, only store user data
      setAuth(response.data.user);
      goBack();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-4xl font-bold text-primary-800 dark:text-primary-400 mb-2">
            Mushroom Hunter
          </h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300">
            Create your account to start tracking
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Register</h2>

          <ErrorAlert error={error} onDismiss={() => setError('')} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                className="input"
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters',
                  },
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className="input"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
