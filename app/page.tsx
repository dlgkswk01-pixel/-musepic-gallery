import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// 다른 파일을 불러오지 않고 여기서 바로 Supabase를 만듭니다. (경로 에러 방지)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default async function GalleryPage() {
  // DB에서 데이터 가져오기
  const { data: exhibits } = await supabase
    .from('exhibits')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main style={{ padding: '40px', fontFamily: 'serif', backgroundColor: '#fcfaf7', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>MusePic Gallery</h1>
        <Link href="/upload" style={{ backgroundColor: 'black', color: 'white', padding: '10px 20px', borderRadius: '20px', textDecoration: 'none', fontSize: '14px' }}>
          Upload
        </Link>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
        {exhibits && exhibits.map((item: any) => (
          <div key={item.id} style={{ border: '1px solid #eee', padding: '15px', backgroundColor: 'white' }}>
            <img 
              src={item.image_url} 
              alt={item.title} 
              style={{ width: '100%', aspectRatio: '3/4', objectCover: 'cover', marginBottom: '15px' }} 
            />
            <h3 style={{ fontSize: '18px', margin: '0 0 5px 0' }}>{item.title}</h3>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>{item.artist_name}</p>
          </div>
        ))}
      </div>

      {(!exhibits || exhibits.length === 0) && (
        <div style={{ textAlign: 'center', padding: '100px 0', border: '2px dashed #ddd', borderRadius: '20px', color: '#aaa' }}>
          전시된 작품이 없습니다. (DB를 확인해주세요)
        </div>
      )}
    </main>
  )
}