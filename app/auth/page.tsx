'use client'

import { useState, useEffect } from 'react'
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

  // 이미 로그인되어 있으면 메인 페이지로
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/')
      }
    })
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // 로그인
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        })
        if (signInError) {
          // Supabase 에러 메시지를 더 친화적으로
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('이메일 또는 비밀번호가 잘못되었습니다.')
          }
          throw signInError
        }
        
        // 로그인 성공 후 세션 확인
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/')
      } else {
        // 회원가입
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
        })
        if (signUpError) throw signUpError

        // 회원가입 성공 시 이메일 검증 필요 표시
        if (data?.user?.identities?.length === 0) {
          setError('⚠️ 이미 가입된 이메일입니다.')
          return
        }

        // 자동 로그인 시도
        const { error: autoLoginError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        })

        if (!autoLoginError) {
          setError('✅ 회원가입 성공! 이동 중...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          router.push('/')
        } else {
          setError('✅ 회원가입 완료! 로그인해주세요.')
          setIsLogin(true)
          setPassword('')
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || '오류 발생. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7] p-10 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-sm space-y-6">
        <h1 className="text-3xl font-serif font-bold text-center">MusePic</h1>
        <p className="text-center text-stone-500 text-sm">전시관을 만들어보세요</p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full border-b border-stone-200 py-3 outline-none focus:border-stone-900 transition text-sm disabled:opacity-50"
            />

            <input
              type="password"
              placeholder="Password (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              className="w-full border-b border-stone-200 py-3 outline-none focus:border-stone-900 transition text-sm disabled:opacity-50"
            />
          </div>

          {error && (
            <p className={`text-sm text-center p-3 rounded ${error.includes('✅') ? 'bg-green-50 text-green-700' : error.includes('⚠️') ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-black text-white py-3 rounded-full font-bold text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition disabled:bg-stone-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isLogin ? 'LOGIN' : 'SIGN UP'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-200" />
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setPassword('')
            }}
            disabled={loading}
            className="text-stone-500 text-xs font-bold uppercase tracking-wider hover:text-stone-900 transition disabled:opacity-50"
          >
            {isLogin ? '회원가입' : '로그인'}
          </button>
          <div className="flex-1 h-px bg-stone-200" />
        </div>
      </div>
    </div>
  )
}
