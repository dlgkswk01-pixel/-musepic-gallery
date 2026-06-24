# 🎨 MusePic - 설정 가이드

## 1️⃣ Supabase 설정

### 1.1 데이터베이스 테이블 생성
Supabase 대시보시 → SQL Editor에서 다음을 실행:

```sql
-- exhibits 테이블 수정 (user_id 추가)
ALTER TABLE exhibits ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- spotify_tracks 테이블 생성
CREATE TABLE spotify_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibit_id UUID REFERENCES exhibits(id) ON DELETE CASCADE,
  spotify_id TEXT,
  track_name TEXT,
  artist_name TEXT,
  preview_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 인덱스 추가
CREATE INDEX idx_exhibits_user_id ON exhibits(user_id);
```

### 1.2 행 수준 보안 (RLS) 설정
```sql
-- exhibits 테이블
ALTER TABLE exhibits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all exhibits" ON exhibits
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own exhibits" ON exhibits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exhibits" ON exhibits
  FOR DELETE USING (auth.uid() = user_id);

-- spotify_tracks 테이블
ALTER TABLE spotify_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view spotify tracks" ON spotify_tracks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert spotify tracks" ON spotify_tracks
  FOR INSERT WITH CHECK (true);
```

---

## 2️⃣ Spotify API 설정

### 2.1 Spotify Developer 앱 등록
1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) 방문
2. 로그인 (계정 없으면 회원가입)
3. "Create an App" 클릭
4. 앱 이름 입력, 약관 동의 후 생성
5. **Client ID** 및 **Client Secret** 복사

### 2.2 환경변수 설정
`.env.local` 파일에 추가:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

### 2.3 Redirect URI 설정 (선택사항)
- Spotify Dashboard → Settings
- Redirect URIs에 다음 추가:
  - `http://localhost:3000/auth/callback` (개발)
  - `https://yourdomain.com/auth/callback` (배포)

---

## 3️⃣ 주요 기능

### ✅ 구현된 기능
- 📝 사용자 회원가입/로그인 (Supabase Auth)
- 📸 사진 업로드 (Supabase Storage)
- 🎵 Spotify 곡 검색 및 매칭
- 🖼️ 갤러리 뷰 (모든 사용자의 작품)
- 👤 프로필 페이지 (자신의 작품 관리)
- 🗑️ 작품 삭제 (소유자만)
- 🎬 몰입형 전시 모드 (마우스 추적 스포트라이트)
- 🎶 스포티파이 트랙 재생

### 🔄 백엔드 통합 필요사항
Spotify 음악 재생 기능을 완전하게 사용하려면 다음이 필요합니다:
1. **백엔드 API 엔드포인트** (Node.js/Python)
   - Spotify 토큰 발급 및 갱신
   - 토큰 보안 관리
2. **OAuth 2.0 구현**
   - 사용자가 Spotify 계정 연동

---

## 4️⃣ 실행 방법

```bash
# 1. 패키지 설치
npm install

# 2. 환경변수 설정
# .env.local 파일 작성

# 3. 개발 서버 실행
npm run dev

# 4. 빌드 및 배포
npm run build
npm start
```

---

## 5️⃣ 페이지 구조

```
/                    → 갤러리 (모든 작품)
/auth                → 로그인/회원가입
/upload              → 작품 업로드
/profile             → 사용자 프로필
/[id]                → 작품 상세 감상
```

---

## 🚀 다음 단계 (선택사항)

1. **공유 기능** - URL 복사, SNS 공유
2. **댓글 기능** - 다른 사용자 피드백
3. **좋아요** - 작품 평가
4. **전문 Spotify 연동** - Authorization Code Flow
5. **이미지 최적화** - WebP, 썸네일 생성
6. **분석** - 조회수, 재생수 추적

---

**질문이나 문제 발생 시 GitHub Issues를 통해 연락주세요! 🎨**
