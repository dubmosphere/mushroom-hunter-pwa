import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

/**
 * Custom hook for smart navigation that respects where the user came from
 *
 * @param {string} defaultPath - Default path to navigate to if no context (e.g., '/findings')
 * @returns {object} Navigation utilities
 */
export function useSmartNavigation(defaultPath = '/') {
  const location = useLocation();
  const navigate = useNavigate();
  const hasNavigatedRef = useRef(false);

  // Track if user has navigated within the app
  useEffect(() => {
    hasNavigatedRef.current = true;
  }, [location.pathname]);

  /**
   * Check if there's a valid history to go back to
   * @returns {boolean}
   */
  const hasHistory = () => {
    // If we came here with location state, there's definitely history
    if (location.state?.returnTo || location.state?.fromMap || location.state?.from) {
      return true;
    }
    // If location.key is 'default', it's a direct page load (no app history)
    // Otherwise, we navigated within the app
    return location.key !== 'default';
  };

  /**
   * Get the back navigation path based on location state
   * @returns {string|number} Path string or -1 for browser back
   */
  const getBackPath = () => {
    if (location.state?.returnTo) {
      return location.state.returnTo;
    }
    // Use browser back if there's valid history, otherwise use default
    if (hasHistory()) {
      return -1; // Go back to previous page
    }
    return defaultPath;
  };

  /**
   * Navigate back intelligently
   */
  const goBack = () => {
    const backPath = getBackPath();
    if (backPath === -1) {
      navigate(-1);
      // Scroll to top after browser back navigation completes
      setTimeout(() => window.scrollTo(0, 0), 100);
    } else {
      navigate(backPath);
      // Scroll to top after navigation
      setTimeout(() => window.scrollTo(0, 0), 0);
    }
  };

  /**
   * Click handler for Link components
   * Use this when you need a Link component but want smart navigation
   */
  const handleBackClick = (e) => {
    const backPath = getBackPath();
    if (backPath === -1) {
      e.preventDefault();
      navigate(-1);
      // Scroll to top after browser back navigation completes
      setTimeout(() => window.scrollTo(0, 0), 100);
    }
  };

  /**
   * Get the 'to' prop for Link components
   * Returns '#' for browser back, or the actual path
   */
  const getLinkTo = () => {
    const backPath = getBackPath();
    return typeof backPath === 'number' ? '#' : backPath;
  };

  return {
    getBackPath,
    goBack,
    handleBackClick,
    getLinkTo,
  };
}
