import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { LoadingSpinner } from './loading-spinner';

/**
 * Example usage of LoadingSpinner component
 * This file demonstrates different ways to use loading spinners
 */

// Example 1: Standalone spinner with different sizes
export function StandaloneSpinnerExample() {
  return (
    <div className="space-y-4">
      <LoadingSpinner size="sm" text="Small spinner" />
      <LoadingSpinner size="md" text="Medium spinner" />
      <LoadingSpinner size="lg" text="Large spinner" />
    </div>
  );
}

// Example 2: Spinner in buttons
export function SpinnerButtonExample() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button disabled size="sm">
        <Spinner data-icon="inline-start" />
        Loading...
      </Button>
      <Button variant="outline" disabled size="sm">
        <Spinner data-icon="inline-start" />
        Please wait
      </Button>
      <Button variant="secondary" disabled size="sm">
        <Spinner data-icon="inline-start" />
        Processing
      </Button>
    </div>
  );
}

// Example 3: Full page loading
export function FullPageLoadingExample() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" text="Loading application..." />
    </div>
  );
}

// Example 4: Card loading state
export function CardLoadingExample() {
  return (
    <div className="rounded border p-8">
      <LoadingSpinner text="Fetching data..." />
    </div>
  );
}
