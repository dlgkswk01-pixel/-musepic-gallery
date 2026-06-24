'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '../supabase'

type Exhibit = {
  id: string
  title: string
  artist_name: string
  image_url: string
  album_art?: string
  track_name?: string
  track_artist?: string
  preview_url?: string
}

export default function ExhibitDetail() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()
  const [data, setData] = useState<Exhibit | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const audioRef = useRef<HTMLAudioElement>(null)
  const rafRef = useRef<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!id) {
      setError('Invalid exhibit ID.')
      setStatus('error')
      return
    }

    if (!supabase) {
      setError('Supabase client is not configured.')
      setStatus('error')
      return
    }

    setStatus('loading')

    const fetchExhibit = async () => {
      try {
        const { data: exhibit, error: fetchError } = await supabase!
          .from('exhibits')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError || !exhibit) {
          setError(fetchError?.message || 'Exhibit not found.')
          setStatus('error')
          return
        }

        setData(exhibit as Exhibit)
        setStatus('success')
      } catch (fetchError) {
        setError(String(fetchError))
        setStatus('error')
      }
    }

    fetchExhibit()
  }, [id])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setMousePos({
          x: (event.clientX / window.innerWidth) * 100,
          y: (event.clientY / window.innerHeight) * 100,
        })
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const togglePlay = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      return
    }

    try {
      await audioRef.current.play()
    } catch (playError) {
      setError('Unable to play audio. Please check your browser settings.')
      console.error(playError)
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  if (status === 'loading' || status === 'idle') {
    return <div className="h-screen bg-black text-white flex items-center justify-center">Loading exhibit…</div>
  }

  if (status === 'error') {
    return (
      <div className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold">Unable to load the exhibit.</p>
        <p className="max-w-md text-sm text-white/50">{error || 'Please try again later.'}</p>
        <button onClick={handleBack} className="px-6 py-3 bg-white/10 border border-white/10 rounded-full text-sm text-white hover:bg-white/5 transition">
          Back to Gallery
        </button>
      </div>
    )
  }

  if (!data) {
    return <div className="h-screen bg-black text-white flex items-center justify-center">Exhibit data not loaded.</div>
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center overflow-hidden relative">
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, transparent 5%, rgba(0,0,0,0.97) 40%)`,
        }}
      />

      <button
        onClick={handleBack}
        className="fixed top-10 left-10 z-50 text-white/40 hover:text-white transition uppercase text-[10px] tracking-widest font-bold"
      >
        ← Back to Gallery
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1 }}
        className="z-10 text-center space-y-12"
      >
        <img
          src={data.image_url}
          alt={data.title}
          className="h-[65vh] shadow-[0_0_100px_rgba(255,255,255,0.05)] border border-white/5 mx-auto object-cover"
        />
        <div className="space-y-3">
          <h2 className="font-serif text-5xl md:text-6xl tracking-tighter">{data.title}</h2>
          <p className="text-white/30 uppercase text-[10px] tracking-[0.4em] font-bold italic">Captured by {data.artist_name}</p>
        </div>
      </motion.div>

      <div className="fixed bottom-12 z-50 w-full max-w-sm px-6">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-4 rounded-[2.5rem] flex items-center gap-5 shadow-2xl">
          <img
            src={data.album_art || 'https://via.placeholder.com/100'}
            alt={data.track_name ? `${data.track_name} album art` : 'Album art placeholder'}
            className="w-14 h-14 rounded-2xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold truncate tracking-tight">{data.track_name || 'Spotify Music'}</h4>
            <p className="text-[10px] text-white/40 truncate uppercase font-bold">{data.track_artist || 'Artist'}</p>
            <div className="h-0.5 bg-white/10 rounded-full mt-3 overflow-hidden">
              <motion.div
                className="h-full bg-white/60 w-full"
                animate={{ x: isPlaying ? ['-100%', '0%'] : '-100%' }}
                transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
              />
            </div>
          </div>
          <button
            onClick={togglePlay}
            disabled={!data.preview_url}
            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPlaying ? 'Ⅱ' : '▶'}
          </button>
        </div>
        <audio
          ref={audioRef}
          src={data.preview_url}
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <p className="text-center text-[9px] text-white/20 mt-5 tracking-[0.3em] font-bold uppercase">Synced with Spotify Music</p>
      </div>
    </div>
  )
}
