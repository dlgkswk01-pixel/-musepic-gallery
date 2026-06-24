'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAuth = async () => {
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // 로그인
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        router.push('/')
      } else {
        // 회원가입
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        setError('✅ 회원가입 완료! 로그인하세요.')
        setIsLogin(true)
        setPassword('')
      }
    } catch (err: any) {
      setError(err.message || '오류 발생')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7] p-10 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-sm space-y-6">
        <h1 className="text-3xl font-serif font-bold text-center">MusePic</h1>
        <p className="text-center text-stone-500 text-sm">전시관을 만들어보세요</p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-stone-200 py-3 outline-none focus:border-stone-900 transition text-sm"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-stone-200 py-3 outline-none focus:border-stone-900 transition text-sm"
          />
        </div>

        {error && (
          <p className={`text-sm text-center ${error.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {error}
          </p>
        )}

        <button
          onClick={handleAuth}
          disabled={loading || !email || !password}
          className="w-full bg-black text-white py-3 rounded-full font-bold text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition disabled:bg-stone-300"
        >
          {loading ? 'Processing...' : isLogin ? 'LOGIN' : 'SIGN UP'}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-200" />
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setPassword('')
            }}
            className="text-stone-500 text-xs font-bold uppercase tracking-wider hover:text-stone-900 transition"
          >
            {isLogin ? '회원가입' : '로그인'}
          </button>
          <div className="flex-1 h-px bg-stone-200" />
        </div>
      </div>
    </div>
  )
}
