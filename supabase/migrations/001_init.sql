-- 기부금 결제/신청 테이블
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 강의 정보
  lecture_title TEXT NOT NULL,
  lecture_description TEXT,
  
  -- 기부 정보
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'kakaopay')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  
  -- 결제 정보 (카카오페이)
  kakaopay_tid TEXT,
  kakaopay_order_id TEXT,
  
  -- 기부자 정보
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- 영수증 정보
  receipt_required BOOLEAN DEFAULT FALSE,
  resident_number_encrypted TEXT, -- 주민번호 앞 7자리 암호화
  
  -- 입금 정보 (무통장)
  deposit_name_format TEXT, -- 입금자명 형식 예: 홍길동1234
  deposit_confirmed_at TIMESTAMPTZ,
  deposit_confirmed_by TEXT
);

-- 관리자 세션 (간단한 비밀번호 인증용)
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL UNIQUE
);

-- 인덱스
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_payment_method ON donations(payment_method);
CREATE INDEX idx_donations_receipt_required ON donations(receipt_required);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);
