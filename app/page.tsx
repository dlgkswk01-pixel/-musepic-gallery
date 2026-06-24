import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-semibold tracking-tight">Musepic Gallery</h1>
        <p className="mt-6 text-white/60 text-sm leading-7">
          This app uses dynamic exhibit pages at <code className="rounded bg-white/10 px-2 py-1">/[id]</code>.
          Add a gallery listing here or navigate directly to an exhibit route such as <code className="rounded bg-white/10 px-2 py-1">/1</code>.
        </p>
        <div className="mt-10 inline-flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/1" className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
            Example Exhibit
          </Link>
        </div>
      </div>
    </main>
  )
}
