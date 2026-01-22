export default function StatCard({ label, value, hint, tone = 'slate' }) {
  const toneMap = {
    slate: 'bg-slate-50 text-slate-900 ring-slate-200',
    sky: 'bg-sky-50 text-sky-900 ring-sky-200',
    emerald: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-900 ring-amber-200',
    red: 'bg-red-50 text-red-900 ring-red-200',
  }

  let toneClass = toneMap.slate
  if (toneMap[tone]) {
    toneClass = toneMap[tone]
  }

  return (
    <div className={['rounded-2xl p-4 ring-1', toneClass].join(' ')}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-sm opacity-80">{hint}</div>}
    </div>
  )
}
