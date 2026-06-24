export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// 환경 변수가 없을 때를 대비한 안전 장치
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function Page() {
  let exhibits: any[] = []
  
  try {
    const { data } = await supabase.from('exhibits').select('*')
    if (data) exhibits = data
  } catch (e) {
    console.error('데이터를 불러오지 못했습니다.')
  }

  return (
    <main className="p-10 bg-[#fcfaf7] min-h-screen">
      <nav className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-serif font-bold">MusePic Gallery</h1>
        <Link href="/upload" className="bg-black text-white px-4 py-2 rounded-full text-sm">Upload</Link>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {exhibits.map((item: any) => (
          <div key={item.id} className="bg-white p-4 shadow-sm">
            <img src={item.image_url} className="w-full aspect-[3/4] object-cover mb-4" alt="art" />
            <h2 className="font-serif text-lg">{item.title}</h2>
          </div>
        ))}
      </div>
      
      {exhibits.length === 0 && (
        <div className="py-20 text-center text-gray-400 border-2 border-dashed rounded-3xl">
          전시된 작품이 없습니다. (DB 연결 확인 필요)
        </div>
      )}
    </main>
  )
}