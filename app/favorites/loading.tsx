export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
