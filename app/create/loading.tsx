export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-64 bg-gray-200 rounded mb-8" />
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 h-2 rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-11 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
