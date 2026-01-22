import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="mt-4 inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white">
        Go home
      </Link>
    </div>
  )
}
