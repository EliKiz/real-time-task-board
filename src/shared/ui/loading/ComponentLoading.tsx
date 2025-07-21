import { LoadingSpinner } from './LoadingSpinner';

interface ComponentLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ComponentLoading = (
  {
    message = "Loading...",
    size = "md"
  }: ComponentLoadingProps
) => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <LoadingSpinner size={size} className="mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}; 