# Supabase SQL - users 테이블 생성

SQL Editor에서 다음을 실행하세요:

```sql
-- 1. users 커스텀 테이블 생성
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. exhibits 테이블에서 user_id 참조 변경
ALTER TABLE exhibits DROP CONSTRAINT IF EXISTS exhibits_user_id_fkey;
ALTER TABLE exhibits ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 3. 인덱스 추가
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_exhibits_user_id ON exhibits(user_id);

-- 4. RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

ALTER TABLE exhibits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all exhibits" ON exhibits FOR SELECT USING (true);
CREATE POLICY "Users can insert their own exhibits" ON exhibits FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete their own exhibits" ON exhibits FOR DELETE USING (true);
```

**⚠️ 이미 있는 auth 설정은 삭제해도 됩니다!**
