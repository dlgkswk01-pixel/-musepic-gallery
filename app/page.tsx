import { supabase } from './lib/supabase'
import Link from 'next/link'

export default async function Page() {
  const { data } = await supabase.from('exhibits').select('*').order('created_at', { ascending: false })

  return (
    <main className="p-10 max-w-7xl mx-auto min-h-screen bg-[#fcfaf7]">
      <nav className="flex justify-between items-center mb-20">
        <h1 className="text-2xl font-serif font-bold">MusePic</h1>
        <Link href="/upload" className="bg-stone-900 text-white px-6 py-2 rounded-full text-sm">Upload</Link>
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {data?.map((item) => (
          <Link href={`/exhibit/${item.id}`} key={item.id} className="group">
            <div className="aspect-[3/4] overflow-hidden bg-gray-200 mb-4">
              <img src={item.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            </div>
            <h3 className="font-serif text-lg">{item.title}</h3>
          </Link>
        ))}
      </div>
    </main>
  )
}