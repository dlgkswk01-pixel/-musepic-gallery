'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpload = async () => {
    if (!file || !title) return alert('사진과 제목을 입력해주세요!')
    setLoading(true)

    try {
      // 1. Supabase Storage에 이미지 업로드
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 이미지의 공용 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName)

      // 2. DB에 정보 저장
      const { error: dbError } = await supabase.from('exhibits').insert({
        title,
        artist_name: artist || 'Anonymous',
        image_url: publicUrl,
        created_at: new Date()
      })

      if (dbError) throw dbError

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
        
        <div className="space-y-4">
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
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
        </div>

        <button 
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-full font-bold text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition disabled:bg-stone-300"
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