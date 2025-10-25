import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../utils/api';
import useAuthStore from '../store/authStore';
import ErrorAlert from '../components/ErrorAlert';
import Logo from '../components/Logo';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.login(data);
      // Token is now in httpOnly cookie, only store user data
      setAuth(response.data.user);

      // Navigate to the page they were trying to access, or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
            Track and explore mushrooms in Switzerland
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Login</h2>

          <ErrorAlert error={error} onDismiss={() => setError('')} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
