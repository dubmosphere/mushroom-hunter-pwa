import { AlertTriangle } from 'lucide-react';

/**
 * Reusable error alert component
 * Displays error messages with consistent styling
 */
function ErrorAlert({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
      <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {typeof error === 'string' ? error : error.message || 'An error occurred'}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 ml-auto"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default ErrorAlert;
