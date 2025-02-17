import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <div className="p-4 rounded-lg bg-red-800">
            <h2 className="font-semibold mb-2">Error:</h2>
            <pre className="whitespace-pre-wrap">
              {this.state.error?.message}
            </pre>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
