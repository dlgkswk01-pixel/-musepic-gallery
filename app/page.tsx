export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default async function GalleryPage() {
  const { data: exhibits } = await supabase.from('exhibits').select('*').order('created_at', { ascending: false })

  return (
    <main className="min-h-screen p-8 md:p-20 max-w-7xl mx-auto">
      <nav className="flex justify-between items-center mb-32">
        <h1 className="font-serif text-3xl font-bold tracking-tighter uppercase">MusePic</h1>
        <Link href="/upload" className="bg-black text-white px-8 py-2.5 rounded-full text-xs font-bold hover:scale-105 transition">UPLOAD</Link>
      </nav>

      <header className="mb-24">
        <p className="text-[10px] uppercase tracking-[0.5em] text-stone-400 mb-4 font-bold">Virtual Exhibition</p>
        <h2 className="font-serif text-6xl md:text-8xl leading-tight tracking-tight text-stone-800">Nature's <br/>Echo</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-24">
        {exhibits?.map((item) => (
          <Link href={`/${item.id}`} key={item.id} className="group block">
            <div className="aspect-[3/4] overflow-hidden bg-stone-200 relative mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-700">
              <img 
                src={item.image_url} 
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                alt={item.title} 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-2xl tracking-tight text-stone-800">{item.title}</h3>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Photo by {item.artist_name}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}