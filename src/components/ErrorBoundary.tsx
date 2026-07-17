import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Intentionally no console logging in production build.
    void error;
    void info;
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
          <div className="register-lines absolute inset-0 -z-10 opacity-40" />
          <span className="font-mono text-xs uppercase tracking-widest text-seal">Docket Error</span>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
            Something broke the record.
          </h1>
          <p className="mt-3 max-w-md text-sm text-ink/60">
            An unexpected error interrupted this page. Reloading usually clears it —
            no dispute data was lost.
          </p>
          <button
            onClick={() => window.location.assign('/')}
            className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper-50"
          >
            Return home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
