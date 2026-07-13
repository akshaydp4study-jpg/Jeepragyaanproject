import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  sectionName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught an error in "${this.props.sectionName}":`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-bg-panel border border-alert-red rounded-lg text-center select-none font-rajdhani">
          <div className="w-12 h-12 flex items-center justify-center bg-alert-red/25 border border-alert-red text-alert-red font-bold font-orbitron mb-4 text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-text-primary uppercase tracking-wider font-orbitron mb-2">
            Section Error: {this.props.sectionName}
          </h2>
          <p className="text-sm text-text-muted max-w-md mb-4 leading-relaxed">
            The core terminal module for this section encountered a fatal runtime exception. System integrity preserved.
          </p>
          {this.state.error && (
            <pre className="p-3 bg-bg-void border border-border-subtle text-alert-red text-xs font-mono-tech rounded text-left overflow-auto max-w-full max-h-[120px] mb-6">
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="px-6 py-2 bg-alert-red border border-alert-red text-white font-orbitron font-bold uppercase tracking-widest text-xs transition-all hover:bg-transparent hover:text-alert-red active:scale-95 cursor-pointer"
          >
            Re-Initialize System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
