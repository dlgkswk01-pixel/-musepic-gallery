'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ExhibitDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    supabase.from('exhibits').select('*').eq('id', id).single().then(({data}) => setData(data))
    const move = (e: MouseEvent) => setPos({ x: (e.clientX/window.innerWidth)*100, y: (e.clientY/window.innerHeight)*100 })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [id])

  if (!data) return <div className="h-screen bg-black" />

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center overflow-hidden relative">
      {/* 🔦 마우스 추적 스포트라이트 조명 */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, transparent 5%, rgba(0,0,0,0.97) 40%)` }}
      />

      <button onClick={() => router.back()} className="fixed top-10 left-10 z-50 text-white/40 hover:text-white transition text-[10px] tracking-widest font-bold">← BACK</button>

      {/* 아트워크 */}
      <div className="z-10 text-center space-y-12 animate-in fade-in duration-1000">
        <img src={data.image_url} className="h-[65vh] shadow-[0_0_80px_rgba(255,255,255,0.05)] border border-white/5 mx-auto" />
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
    </div>
  )
}