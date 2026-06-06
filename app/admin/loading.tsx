export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="h-11 bg-gray-900" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="h-8 w-56 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-80 bg-gray-200 rounded mb-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5">
            <div className="w-28 h-24 bg-gray-200 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-2/3 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 rounded" />
              <div className="h-3 w-1/3 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
