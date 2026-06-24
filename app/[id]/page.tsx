'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ExhibitDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const [isImageHovered, setIsImageHovered] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    supabase.from('exhibits').select('*').eq('id', id).single().then(({data}) => setData(data))
    const move = (e: MouseEvent) => setPos({ x: (e.clientX/window.innerWidth)*100, y: (e.clientY/window.innerHeight)*100 })
    window.addEventListener('mousemove', move)
    
    // ESC 키로 풀스크린 모드 닫기
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [id, isFullscreen])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // 1. Storage에서 이미지 삭제
      if (data.image_url) {
        const fileName = data.image_url.split('/').pop()
        await supabase.storage.from('gallery').remove([fileName])
      }

      // 2. DB에서 레코드 삭제
      const { error } = await supabase.from('exhibits').delete().eq('id', id)
      if (error) throw error

      alert('전시가 종료되었습니다!')
      router.push('/')
    } catch (error: any) {
      alert('삭제 실패: ' + error.message)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (!data) return <div className="h-screen bg-black" />

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center overflow-hidden relative">
      {/* 🔦 마우스 추적 스포트라이트 조명 */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, transparent 5%, rgba(0,0,0,0.97) 40%)` }}
      />

      <button onClick={() => router.back()} className="fixed top-10 left-10 z-50 text-white/40 hover:text-white transition text-[10px] tracking-widest font-bold">← BACK</button>

      <button 
        onClick={() => setShowDeleteConfirm(true)} 
        className="fixed top-10 right-10 z-50 text-white/40 hover:text-red-400 transition flex items-center gap-2"
        title="Delete exhibit"
      >
        <Trash2 size={16} />
        <span className="text-[10px] tracking-widest font-bold">DELETE</span>
      </button>

      {/* 아트워크 */}
      <div className="z-10 text-center space-y-12 animate-in fade-in duration-1000">
        <div
          onClick={() => setIsFullscreen(true)}
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
          className={`transition-transform duration-300 ease-out cursor-pointer ${isImageHovered ? 'scale-105' : 'scale-100'}`}
        >
          <img src={data.image_url} className="h-[65vh] shadow-[0_0_80px_rgba(255,255,255,0.05)] border border-white/5 mx-auto" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-5xl md:text-6xl tracking-tighter">{data.title}</h2>
          <p className="text-white/30 uppercase text-[10px] tracking-[0.4em] font-bold italic">Captured by {data.artist_name}</p>
        </div>
      </div>

      {/* 🎵 Spotify 스타일 커스텀 플레이어 */}
      <div className="fixed bottom-12 z-50 w-full max-w-sm px-6">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-4 rounded-[2.5rem] flex items-center gap-5 shadow-2xl">
          <div className="w-14 h-14 bg-stone-800 rounded-2xl overflow-hidden flex-shrink-0">
             <img src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold truncate tracking-tight">{data.title} Mix</h4>
            <p className="text-[10px] text-white/40 truncate uppercase font-bold tracking-widest">Ambient Selection</p>
            <div className="h-0.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className={`h-full bg-white/60 transition-all duration-[30s] ${isPlaying ? 'w-full' : 'w-0'}`} />
            </div>
          </div>
          <button 
            onClick={() => {
              if(isPlaying) audioRef.current?.pause(); else audioRef.current?.play();
              setIsPlaying(!isPlaying);
            }} 
            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition shrink-0 shadow-lg"
          >
            <span className="text-xl ml-1">{isPlaying ? 'Ⅱ' : '▶'}</span>
          </button>
        </div>
        <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop />
        <p className="text-center text-[9px] text-white/20 mt-5 tracking-[0.3em] font-bold uppercase">Synced with Curator Music</p>
      </div>

      {/* 📸 사진 전시 모드 - 풀스크린 */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden">
          {/* 마우스 추적 스포트라이트 */}
          <div 
            className="fixed inset-0 pointer-events-none"
            style={{ 
              background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.1) 3%, rgba(255,255,255,0.02) 8%, transparent 15%, rgba(0,0,0,0.95) 60%)`
            }}
          />

          {/* 사진 */}
          <div className="z-10 flex items-center justify-center h-full w-full p-8">
            <img 
              src={data.image_url} 
              className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl" 
              alt={data.title}
            />
          </div>

          {/* 닫기 버튼 */}
          <button 
            onClick={() => setIsFullscreen(false)}
            className="fixed top-10 left-10 z-20 text-white/60 hover:text-white transition text-[10px] tracking-widest font-bold"
          >
            ← EXIT
          </button>

          {/* ESC 안내 */}
          <p className="fixed bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-[9px] tracking-[0.2em] font-bold uppercase">Press ESC to exit</p>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 max-w-sm mx-4 space-y-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-white">Delete Exhibit?</h3>
              <p className="text-white/60 text-sm mt-2">This action cannot be undone. The image will be permanently removed.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-lg border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-sm font-bold transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}