"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Card className="mx-auto mt-12 max-w-lg text-center">
          <h2 className="display-sm mb-2">Something went wrong</h2>
          <p className="mb-6 text-muted">
            {this.state.message || "An unexpected error occurred."}
          </p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}
