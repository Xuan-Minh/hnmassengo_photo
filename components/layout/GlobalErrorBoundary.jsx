'use client';
import React from 'react';
import Link from 'next/link';
import { logger } from '../../lib/logger';

/**
 * Global Error Boundary component (no translations dependency)
 */
class GlobalErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('GlobalErrorBoundary caught an error:', error, errorInfo);
    this.state = {
      hasError: true,
      error,
      errorInfo,
    };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center">
            <h1 className="text-4xl md:text-5xl font-serif italic mb-6">
              Something went wrong
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-80">
              We apologize for the inconvenience. An unexpected error occurred.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-8 py-3 border border-white hover:bg-white hover:text-black transition-colors"
              >
                Retry
              </button>
              <Link
                href="/"
                className="px-8 py-3 border border-white hover:bg-white hover:text-black transition-colors inline-block"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function GlobalErrorBoundary({ children }) {
  return <GlobalErrorBoundaryInner>{children}</GlobalErrorBoundaryInner>;
}
