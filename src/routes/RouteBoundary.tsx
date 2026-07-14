import { Component, Suspense, type ErrorInfo, type ReactNode } from 'react';

export function RouteLoadingFallback() {
  return (
    <main className="route-loading-fallback" role="status" aria-live="polite">
      <p>페이지를 불러오는 중입니다.</p>
    </main>
  );
}

type RouteErrorBoundaryProps = {
  children: ReactNode;
  resetKey: string;
};

type RouteErrorBoundaryState = {
  hasError: boolean;
};

class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Deferred route failed to load.', error, info);
  }

  componentDidUpdate(previousProps: RouteErrorBoundaryProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="route-loading-fallback" role="alert">
          <div>
            <h1>페이지 파일을 불러오지 못했습니다.</h1>
            <p>새로고침한 뒤 다시 시도해 주세요.</p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export function DeferredRoute({
  children,
  fallback = <RouteLoadingFallback />,
  resetKey,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  resetKey: string;
}) {
  return (
    <RouteErrorBoundary resetKey={resetKey}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </RouteErrorBoundary>
  );
}
