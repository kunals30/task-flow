export const Spinner = ({ className = "h-4 w-4" }: { className?: string }) => (
  <span className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} aria-label="Loading" />
);
