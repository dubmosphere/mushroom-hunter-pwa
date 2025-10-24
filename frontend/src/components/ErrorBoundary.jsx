import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary component to catch and display React errors gracefully
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);

    // You could send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                  <AlertTriangle size={48} className="text-red-600 dark:text-red-400" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Oops! Something went wrong
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We encountered an unexpected error. Don't worry, we've logged it and will look into it.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-gray-100 dark:bg-gray-900 rounded p-4 text-xs overflow-auto max-h-64">
                    <p className="font-bold text-red-600 dark:text-red-400 mb-2">
                      {this.state.error.toString()}
                    </p>
                    <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>
                <a
                  href="/"
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Home size={18} />
                  Go Home
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
