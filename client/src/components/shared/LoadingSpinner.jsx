// client/src/components/shared/LoadingSpinner.jsx
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-neutral-500 text-sm font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export function CardSkeleton({ rows = 3 }) {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-neutral-100 rounded mb-2" style={{ width: `${60 + (i % 3) * 15}%` }} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-neutral-100">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-3 bg-neutral-200 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
