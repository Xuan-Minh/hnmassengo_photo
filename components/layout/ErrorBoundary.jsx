'use client';
import React from 'react';
import { logger } from '../../lib/logger';

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents entire app crash when a component error occurs
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Mettre à jour l'état pour que le prochain rendu affiche l'UI de secours
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Logger les détails de l'erreur pour la surveillance
    logger.error('ErrorBoundary a capturé une erreur:', error, errorInfo);

    // Stocker les détails de l'erreur dans l'état pour l'affichage
    this.state = {
      hasError: true,
      error,
      errorInfo,
    };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // UI de secours personnalisée
      return (
        <div className="min-h-screen bg-blackCustom text-whiteCustom flex items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center">
            <h1 className="text-4xl md:text-5xl font-playfair italic mb-6">
              Oops, something went wrong
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-80">
              We're sorry for the inconvenience. An unexpected error occurred.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-background/10 p-6 rounded mb-8">
                <summary className="cursor-pointer font-semibold mb-4 hover:text-accent  transition-colors">
                  Error Details (Development Only)
                </summary>
                <pre className="text-sm overflow-auto max-h-64 text-red-300">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-8 py-3 border border-whiteCustom hover:bg-background hover:text-blackCustom transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="px-8 py-3 border border-whiteCustom hover:bg-background hover:text-blackCustom transition-colors inline-block"
              >
                Return Home
              </a>
            </div>

            <p className="mt-8 text-sm opacity-60">
              If the problem persists, please contact{' '}
              <a
                href="mailto:contact@hnmassengo.com"
                className="underline hover:text-accent  transition-colors"
              >
                contact@hnmassengo.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
