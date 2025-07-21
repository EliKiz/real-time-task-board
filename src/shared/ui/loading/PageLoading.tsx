import { LoadingSpinner } from './LoadingSpinner';

interface PageLoadingProps {
  message?: string;
}

export const PageLoading = ({ message = "Loading..." }: PageLoadingProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}; 