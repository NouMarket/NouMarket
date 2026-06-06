export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 h-[calc(100vh-8rem)] flex flex-col animate-pulse">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-hidden">
        {[false, true, false, true, false].map((isMe, i) => (
          <div key={i} className={`flex ${isMe ? "justify-end" : ""}`}>
            <div className={`h-10 rounded-2xl bg-gray-200 ${isMe ? "w-48" : "w-64"}`} />
          </div>
        ))}
      </div>
      <div className="mt-4 h-12 bg-gray-200 rounded-2xl" />
    </div>
  );
}
