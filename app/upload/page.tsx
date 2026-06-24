'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [spotifyTracks, setSpotifyTracks] = useState<any[]>([])
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const router = useRouter()

  // 로그인 확인
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/auth')
    } else {
      setUser(JSON.parse(storedUser))
    }
  }, [])
      }
    })
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    
    if (selectedFile) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  // Spotify 곡 검색
  const searchSpotifyTracks = async (): Promise<void> => {
    if (!searchQuery.trim()) return
    
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
          }
        }
      )
      
      if (response.status === 401) {
        // 토큰 갱신 필요
        await refreshSpotifyToken()
        return searchSpotifyTracks()
      }
      
      const data = await response.json()
      setSpotifyTracks(data.tracks?.items || [])
    } catch (error) {
      console.error('Spotify 검색 실패:', error)
    }
  }

  const refreshSpotifyToken = async (): Promise<void> => {
    // 실제로는 백엔드에서 처리해야 합니다
    console.log('Token refresh needed')
  }

  const handleUpload = async () => {
    if (!file || !title) return alert('사진과 제목을 입력해주세요!')
    setLoading(true)

    try {
      // 1. Supabase Storage에 이미지 업로드
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 이미지의 공용 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName)

      // 2. DB에 작품 정보 저장
      const { data: exhibitData, error: dbError } = await supabase
        .from('exhibits')
        .insert({
          title,
          artist_name: artist || 'Anonymous',
          image_url: publicUrl,
          user_id: user?.id,
          created_at: new Date()
        })
        .select()

      if (dbError) throw dbError

      // 3. Spotify 곡이 선택되면 저장
      if (selectedTrack && exhibitData?.[0]) {
        await supabase.from('spotify_tracks').insert({
          exhibit_id: exhibitData[0].id,
          spotify_id: selectedTrack.id,
          track_name: selectedTrack.name,
          artist_name: selectedTrack.artists[0]?.name,
          preview_url: selectedTrack.preview_url
        })
      }

      alert('전시가 시작되었습니다!')
      router.push('/')
    } catch (error: any) {
      alert('에러 발생: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7] p-10 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-sm space-y-6">
        <h1 className="text-2xl font-serif font-bold text-center">New Exhibit</h1>
        
        {/* 이미지 미리보기 */}
        {preview ? (
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100 shadow-md">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => {
                setFile(null)
                setPreview(null)
              }}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-red-600 transition"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="aspect-[3/4] rounded-lg bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center">
            <p className="text-center text-stone-400 text-sm">사진을 선택해주세요</p>
          </div>
        )}
        
        <div className="space-y-4">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="w-full text-xs text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
          />
          
          <input 
            type="text" 
            placeholder="Title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-b border-stone-200 py-3 outline-none focus:border-stone-900 transition font-serif text-lg"
          />
          
          <input 
            type="text" 
            placeholder="Artist Name" 
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full border-b border-stone-200 py-3 outline-none focus:border-stone-900 transition text-sm"
          />

          {/* Spotify 곡 검색 */}
          <div className="space-y-2 pt-4 border-t border-stone-200">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500">🎵 Spotify 곡 선택 (선택사항)</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="곡 또는 아티스트 검색..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchSpotifyTracks()}
                className="flex-1 border-b border-stone-200 py-2 outline-none focus:border-stone-900 transition text-xs"
              />
              <button 
                onClick={searchSpotifyTracks}
                className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-stone-800 transition"
              >
                검색
              </button>
            </div>

            {selectedTrack && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                <p className="font-bold text-green-900">✓ {selectedTrack.name}</p>
                <p className="text-green-700 text-xs">{selectedTrack.artists[0]?.name}</p>
              </div>
            )}

            {spotifyTracks.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {spotifyTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedTrack(track)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition ${
                      selectedTrack?.id === track.id
                        ? 'bg-black text-white'
                        : 'bg-stone-100 hover:bg-stone-200'
                    }`}
                  >
                    <p className="font-bold truncate">{track.name}</p>
                    <p className="opacity-70 truncate">{track.artists[0]?.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleUpload}
          disabled={loading || !file || !title}
          className="w-full bg-black text-white py-4 rounded-full font-bold text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition disabled:bg-stone-300 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {loading ? 'UPLOADING...' : 'PUBLISH TO GALLERY'}
        </button>
        
        <button 
          onClick={() => router.back()}
          className="w-full text-stone-400 text-[10px] font-bold uppercase tracking-widest"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}