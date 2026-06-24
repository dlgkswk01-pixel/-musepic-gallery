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
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // 이미 로그인되어 있으면 메인 페이지로
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      router.push('/')
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const trimmedUsername = username.toLowerCase().trim()

      if (isLogin) {
        // 로그인: username으로 사용자 조회
        const { data, error: queryError } = await supabase
          .from('users')
          .select('id, username')
          .eq('username', trimmedUsername)
          .single()

        if (queryError || !data) {
          throw new Error('사용자를 찾을 수 없습니다.')
        }

        // 실제로는 비밀번호를 해시해서 비교해야 하지만, 
        // 간단한 테스트를 위해 바로 저장 (⚠️ 프로덕션에서는 절대금지)
        const { data: loginData, error: loginError } = await supabase
          .from('users')
          .select('*')
          .eq('username', trimmedUsername)
          .eq('password', password)
          .single()

        if (loginError || !loginData) {
          throw new Error('비밀번호가 잘못되었습니다.')
        }

        // 로그인 성공
        localStorage.setItem('user', JSON.stringify({
          id: loginData.id,
          username: loginData.username
        }))

        setError('✅ 로그인 성공!')
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/')
      } else {
        // 회원가입: username이 이미 존재하는지 확인
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', trimmedUsername)
          .single()

        if (existingUser) {
          throw new Error('이미 사용 중인 사용자명입니다.')
        }

        // 새 사용자 생성
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            username: trimmedUsername,
            password: password // ⚠️ 실제로는 bcrypt 등으로 해시해야 함
          })
          .select()
          .single()

        if (insertError) throw insertError

        // 회원가입 후 자동 로그인
        localStorage.setItem('user', JSON.stringify({
          id: newUser.id,
          username: newUser.username
        }))

        setError('✅ 회원가입 성공!')
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/')
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
              type="text"
              placeholder="사용자명 (영문, 숫자)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              minLength={3}
              pattern="[a-z0-9_-]*"
              className="w-full border-b border-stone-200 py-3 outline-none focus:border-stone-900 transition text-sm disabled:opacity-50"
            />

            <input
              type="password"
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              className="w-full border-b border-stone-200 py-3 outline-none focus:border-stone-900 transition text-sm disabled:opacity-50"
            />
          </div>

          {error && (
            <p className={`text-sm text-center p-3 rounded ${
              error.includes('✅') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
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
