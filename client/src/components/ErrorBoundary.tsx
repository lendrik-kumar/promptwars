import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 'var(--space-6)' }}>
          <div className="card card--accent" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-3)', color: 'var(--color-red)' }}>Oops, something went wrong.</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
              We've hit an unexpected error. Please try reloading the page.
            </p>
            <div style={{ background: 'var(--color-surface-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', textAlign: 'left', overflowX: 'auto', marginBottom: 'var(--space-5)' }}>
              <code style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>
                {this.state.error?.message || 'Unknown error'}
              </code>
            </div>
            <button
              className="btn btn--primary"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
