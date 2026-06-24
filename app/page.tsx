'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

// 1. Supabase 클라이언트 초기화 (Non-null assertion '!' 추가로 에러 방지)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default function ExhibitDetail() {
  const { id } = useParams()
  const router = useRouter()
  
  const [data, setData] = useState<any>(null)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // 2. 데이터 가져오기 함수 (null 체크 강화)
    const fetchExhibit = async () => {
      // supabase 객체가 유효한지 명시적으로 확인 (Vercel 에러 해결 핵심)
      if (!supabase) return;

      try {
        const { data: exhibit, error: fetchError } = await supabase
          .from('exhibits')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        setData(exhibit)
      } catch (err) {
        console.error('전시 정보를 불러오는 중 에러 발생:', err)
      }
    }

    fetchExhibit()

    // 3. 스포트라이트 마우스 추적 로직
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [id])

  // 4. 음악 재생/일시정지 토글
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  if (!data) return <div className="h-screen bg-black flex items-center justify-center text-white/20 font-serif italic">Loading Exhibition...</div>

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center overflow-hidden relative font-sans">
      
      {/* 🔦 동적 스포트라이트 조명 레이어 */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ 
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, transparent 5%, rgba(0,0,0,0.98) 40%)` 
        }}
      />

      {/* 뒤로가기 버튼 */}
      <button 
        onClick={() => router.back()} 
        className="fixed top-10 left-10 z-50 text-white/40 hover:text-white transition uppercase text-[10px] tracking-[0.3em] font-bold"
      >
        ← Back to Gallery
      </button>

      {/* 중앙 아트워크 섹션 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="z-10 text-center space-y-12"
      >
        <div className="relative group">
          <img 
            src={data.image_url} 
            className="h-[65vh] shadow-[0_0_80px_rgba(255,255,255,0.03)] border border-white/5 mx-auto transition-transform duration-[2s] group-hover:scale-[1.02]" 
            alt={data.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
        
        <div className="space-y-3">
          <h2 className="font-serif text-5xl md:text-6xl tracking-tighter italic">{data.title}</h2>
          <p className="text-white/20 uppercase text-[10px] tracking-[0.5em] font-black">
            Captured by {data.artist_name || 'Anonymous'}
          </p>
        </div>
      </motion.div>

      {/* 🎵 Spotify 커스텀 플레이어 (Glassmorphism UI) */}
      <div className="fixed bottom-12 z-50 w-full max-w-sm px-6">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-4 rounded-[2.5rem] flex items-center gap-5 shadow-2xl">
          <img 
            src={data.album_art || 'https://via.placeholder.com/150'} 
            className={`w-14 h-14 rounded-2xl object-cover transition-transform duration-[5s] ${isPlaying ? 'scale-110 shadow-lg' : 'scale-100'}`} 
            alt="Album Art"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold truncate tracking-tight">{data.track_name || 'Forest Whispers'}</h4>
            <p className="text-[10px] text-white/40 truncate uppercase font-extrabold tracking-widest">{data.track_artist || 'Arlowe S.'}</p>
            
            {/* 프로그레스 바 시뮬레이션 */}
            <div className="h-0.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                <motion.div 
                  className="h-full bg-white/60 w-full" 
                  animate={{ x: isPlaying ? ["-100%", "0%"] : "-100%" }} 
                  transition={{ duration: 30, ease: "linear", repeat: Infinity }} 
                />
            </div>
          </div>
          
          <button 
            onClick={togglePlay} 
            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shrink-0 shadow-xl"
          >
            {isPlaying ? (
              <span className="text-lg font-bold">Ⅱ</span>
            ) : (
              <span className="text-lg ml-1">▶</span>
            )}
          </button>
        </div>
        
        {/* 실제 오디오 객체 */}
        <audio 
          ref={audioRef} 
          src={data.preview_url} 
          loop 
          onPlay={() => setIsPlaying(true)} 
          onPause={() => setIsPlaying(false)} 
        />
        
        <p className="text-center text-[9px] text-white/10 mt-5 tracking-[0.4em] font-black uppercase">
          Synced with Spotify Music
        </p>
      </div>
    </div>
  )
}