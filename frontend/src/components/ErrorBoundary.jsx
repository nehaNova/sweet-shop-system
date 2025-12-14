// src/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // log for debugging
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
          <pre className="mt-3 p-3 bg-gray-100 rounded text-sm overflow-auto">
            {String(this.state.error)}
            {this.state.info?.componentStack}
          </pre>
          <div className="mt-3">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 bg-blue-600 text-white rounded"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}