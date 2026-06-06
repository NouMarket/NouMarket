export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-6 w-48 bg-gray-200 rounded-lg mb-6" />
      <div className="flex gap-6">
        <div className="hidden lg:block w-64 flex-shrink-0 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
