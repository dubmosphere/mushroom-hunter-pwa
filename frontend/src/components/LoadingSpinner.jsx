/**
 * Reusable loading spinner component
 * Used across the app for consistent loading states
 */
function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
