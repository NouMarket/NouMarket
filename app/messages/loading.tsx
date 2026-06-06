export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-64 bg-gray-200 rounded" />
            </div>
            <div className="h-3 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
