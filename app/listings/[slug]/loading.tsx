export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-4 w-64 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-[4/3] rounded-2xl bg-gray-200" />
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 w-3/4 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="h-8 w-36 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
            <div className="h-11 bg-gray-200 rounded-xl" />
            <div className="h-11 bg-gray-100 rounded-xl" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="h-5 w-28 bg-gray-200 rounded" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="space-y-1.5">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
