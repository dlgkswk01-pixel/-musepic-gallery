export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { supabase } from './supabase'

type Exhibit = {
  id: string
  title: string
  artist_name: string
  image_url: string
}

export default async function GalleryPage() {
  let exhibits: Exhibit[] = []
  let hasError = false
  
  if (!supabase) {
    hasError = true
  } else {
    try {
      const { data, error } = await supabase
        .from('exhibits')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase 데이터 호출 에러:', error)
        hasError = true
      } else if (data) {
        exhibits = data as Exhibit[]
      }
    } catch (e) {
      console.error('데이터를 불러오지 못했습니다:', e)
      hasError = true
    }
  }

  return (
    <main className="min-h-screen bg-[#fcfaf7] px-6 py-10 md:px-20 font-sans text-stone-900">
      
      {/* 상단 네비게이션 */}
      <nav className="flex justify-between items-center mb-24 max-w-7xl mx-auto">
        <h1 className="text-2xl font-serif font-bold tracking-tighter">MusePic</h1>
        <div className="flex gap-6 items-center">
          <Link href="/upload" className="bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold hover:scale-105 transition-transform">
            UPLOAD WORK
          </Link>
        </div>
      </nav>

      {/* 헤더 섹션 */}
      <header className="mb-20 max-w-7xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.4em] text-stone-400 mb-3 font-black">
          Online Virtual Exhibition
        </p>
        <h2 className="text-5xl md:text-7xl font-serif leading-[1.1] tracking-tight">
          Nature's <br />
          Silent Whispers
        </h2>
      </header>

      {/* 갤러리 그리드 리스트 */}
      <section className="max-w-7xl mx-auto">
        {hasError && (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-red-200 rounded-[2rem] bg-red-50">
            <p className="text-red-600 font-serif italic text-lg mb-4">
              ⚠️ 데이터를 불러올 수 없습니다.
            </p>
            <p className="text-red-500 text-xs mb-4">
              Supabase 설정을 확인해주세요.
            </p>
          </div>
        )}
        {!hasError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {exhibits.length > 0 ? (
          exhibits.map((item) => (
            <Link href={`/${item.id}`} key={item.id} className="group block">
              <div className="aspect-[3/4] overflow-hidden mb-6 bg-stone-200 relative">
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover shadow-lg transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-serif text-stone-800 tracking-tight group-hover:text-stone-500 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">
                  Photo by {item.artist_name || 'Unknown Artist'}
                </p>
              </div>
            </Link>
          ))
            ) : (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-stone-200 rounded-[2rem]">
                <p className="text-stone-400 font-serif italic text-lg mb-4">
                  아직 전시된 작품이 없습니다.
                </p>
                <Link href="/upload" className="text-xs font-bold text-stone-900 underline underline-offset-4 hover:text-stone-500">
                  첫 번째 작품 업로드하기
                </Link>
              </div>
            )}
        )}
      </section>

      {/* 푸터 */}
      <footer className="mt-40 pt-12 border-t border-stone-200 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 pb-12">
        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
          © 2024 MusePic Gallery — Virtual Photo Space
        </p>
        <div className="flex gap-8 text-[10px] uppercase tracking-widest text-stone-400 font-bold">
          <span>About</span>
          <span>Contact</span>
        </div>
      </footer>
    </main>
  )
}