export default function LoadingSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={'space-y-3 ' + className}>
      {Array.from({ length: lines }).map(function (_, i) {
        return (
          <div
            key={i}
            className="skeleton h-4"
            style={{ width: (85 - i * 10) + '%' }}
          />
        );
      })}
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map(function (_, i) {
        return (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="skeleton h-4 w-1/3 mb-3" />
            <div className="skeleton h-8 w-2/3 mb-2" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        );
      })}
    </div>
  );
}
