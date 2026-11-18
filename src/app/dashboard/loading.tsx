export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-pulse">
      <div className="h-20 w-1/2 rounded-3xl bg-white/[0.03] border border-white/[0.08]" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-3xl bg-white/[0.03] border border-white/[0.08]" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-3xl bg-white/[0.03] border border-white/[0.08]" />
        ))}
      </div>
    </div>
  )
}

