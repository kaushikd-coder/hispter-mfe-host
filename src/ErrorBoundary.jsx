import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Remote crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <strong className="font-semibold">Module load error:</strong>
          <div className="mt-1">{this.props.message || 'Remote module is unavailable.'}</div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 rounded-md bg-white px-3 py-1 text-sm text-red-600 ring-1 ring-red-300 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
