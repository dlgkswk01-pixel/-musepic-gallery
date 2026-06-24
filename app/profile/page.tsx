'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [exhibits, setExhibits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/auth')
      return
    }

    const parsedUser = JSON.parse(storedUser)
    setUser(parsedUser)

    // 사용자의 작품만 조회
    const fetchExhibits = async () => {
      const { data } = await supabase
        .from('exhibits')
        .select('*')
        .eq('user_id', parsedUser.id)
        .order('created_at', { ascending: false })

      setExhibits(data || [])
      setLoading(false)
    }

    fetchExhibits()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/auth')
  }

  const handleDelete = async (exhibitId: string, imageUrl: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      // 1. Storage에서 이미지 삭제
      const fileName = imageUrl.split('/').pop()
      if (fileName) {
        await supabase.storage.from('gallery').remove([fileName])
      }

      // 2. DB에서 삭제
      await supabase.from('exhibits').delete().eq('id', exhibitId)

      setExhibits(exhibits.filter(e => e.id !== exhibitId))
      alert('삭제되었습니다!')
    } catch (error: any) {
      alert('삭제 실패: ' + error.message)
    }
  }

  if (loading) return <div className="h-screen bg-[#fcfaf7]" />

  return (
    <main className="min-h-screen p-8 md:p-20 max-w-7xl mx-auto">
      <nav className="flex justify-between items-center mb-12">
        <Link href="/" className="text-stone-700 text-[10px] font-bold uppercase tracking-widest hover:text-stone-900">← Back to Gallery</Link>
        <h1 className="font-serif text-2xl font-bold">My Exhibitions</h1>
        <button
          onClick={handleLogout}
          className="text-stone-700 text-xs font-bold uppercase tracking-widest border border-stone-300 px-4 py-2 rounded-full hover:bg-red-50 hover:border-red-300 transition"
        >
          LOGOUT
        </button>
      </nav>

      <div className="mb-8 pb-8 border-b border-stone-200">
        <p className="text-stone-600 text-sm">{user?.email}</p>
        <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Created {exhibits.length} exhibition{exhibits.length !== 1 ? 's' : ''}</p>
      </div>

      {exhibits.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-stone-400 mb-6">아직 만든 전시가 없습니다.</p>
          <Link
            href="/upload"
            className="inline-block bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:scale-105 transition"
          >
            첫 전시 만들기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exhibits.map((exhibit) => (
            <div key={exhibit.id} className="space-y-4 group">
              <div className="aspect-[3/4] overflow-hidden bg-stone-200 rounded-lg shadow-sm group-hover:shadow-lg transition-all">
                <img
                  src={exhibit.image_url}
                  alt={exhibit.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-800">{exhibit.title}</h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest">by {exhibit.artist_name}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/${exhibit.id}`}
                  className="flex-1 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold text-center hover:bg-stone-900 transition"
                >
                  VIEW
                </Link>
                <button
                  onClick={() => handleDelete(exhibit.id, exhibit.image_url)}
                  className="flex-1 border border-red-300 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-50 transition"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
