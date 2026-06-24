import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// 1. Supabase 클라이언트 설정 (환경 변수 사용)
// Vercel Settings에 입력한 NEXT_PUBLIC_... 값들을 자동으로 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function GalleryPage() {
  // 2. DB에서 전시물 데이터 가져오기
  // 환경 변수가 제대로 설정되지 않았을 경우를 대비해 try-catch 처리
  let exhibits: any[] = []
  let envError = false

  if (!supabaseUrl || !supabaseKey) {
    envError = true
  } else {
    try {
      const { data, error } = await supabase
        .from('exhibits')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) exhibits = data
    } catch (e) {
      console.error('데이터 로딩 에러:', e)
    }
  }

  return (
    <main className="min-h-screen bg-[#fcfaf7] px-6 py-10 md:px-20 font-sans text-stone-900">
      
      {/* [상단 네비게이션] */}
      <nav className="flex justify-between items-center mb-24 max-w-7xl mx-auto">
        <h1 className="text-2xl font-serif font-bold tracking-tighter">MusePic</h1>
        <div className="flex gap-6 items-center">
          <Link href="/upload" className="bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold hover:scale-105 transition-transform">
            UPLOAD WORK
          </Link>
        </div>
      </nav>

      {/* [전시 타이틀 섹션] */}
      <header className="mb-20 max-w-7xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.4em] text-stone-400 mb-3 font-black">
          Online Virtual Exhibition
        </p>
        <h2 className="text-5xl md:text-7xl font-serif leading-[1.1] tracking-tight">
          Nature's <br />
          Silent Whispers
        </h2>
      </header>

      {/* [환경 변수 에러 발생 시 안내] */}
      {envError && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl mb-10 text-red-600 text-sm max-w-2xl mx-auto text-center">
          <p className="font-bold mb-1">환경 변수가 설정되지 않았습니다.</p>
          <p>Vercel Settings에서 NEXT_PUBLIC_SUPABASE_URL 및 ANON_KEY를 확인하세요.</p>
        </div>
      )}

      {/* [갤러리 그리드] */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
        {exhibits && exhibits.length > 0 ? (
          exhibits.map((item) => (
            <Link href={`/exhibit/${item.id}`} key={item.id} className="group block">
              {/* 이미지 프레임 */}
              <div className="aspect-[3/4] overflow-hidden mb-6 bg-stone-200 relative">
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover shadow-lg transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                />
                {/* 호버 시 나타나는 오버레이 */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {/* 작품 정보 */}
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
          /* 작품이 없을 때 보여주는 빈 화면 가이드 */
          <div className="col-span-full py-32 text-center border-2 border-dashed border-stone-200 rounded-[2rem]">
            <p className="text-stone-400 font-serif italic text-lg mb-4">
              아직 전시된 작품이 없습니다.
            </p>
            <Link href="/upload" className="text-xs fon