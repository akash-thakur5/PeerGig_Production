-- ============================================================
-- PeerGig Production Database Schema
-- On PeerGig, EVERYONE is a student — you can earn by teaching
-- and learn from other students. No separate tutor/student roles.
-- All prices are in INR (₹).
-- ============================================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role         TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student')),
  avatar_url   TEXT,
  bio          TEXT,
  rating       NUMERIC(3,2) DEFAULT 0,
  total_earned NUMERIC(10,2) DEFAULT 0,
  swap_credits INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- GIGS TABLE
CREATE TABLE IF NOT EXISTS gigs (
  id               SERIAL PRIMARY KEY,
  tutor_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  subject          TEXT NOT NULL,
  price_per_session NUMERIC(8,2) NOT NULL DEFAULT 0,
  tags             TEXT[] DEFAULT '{}',
  timing_slots     TEXT[] DEFAULT '{}',
  language         TEXT DEFAULT 'English',
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id           SERIAL PRIMARY KEY,
  gig_id       INTEGER NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  student_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  meet_link    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- WALLET TRANSACTIONS TABLE
-- amount is always positive; type indicates credit or debit
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  sender_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- SKILL OFFERS TABLE (Skillswap feature)
CREATE TABLE IF NOT EXISTS skill_offers (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_have  TEXT NOT NULL,
  skill_want  TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- SKILLSWAP REQUESTS / NEGOTIATIONS TABLE
CREATE TABLE IF NOT EXISTS skillswap_requests (
  id           SERIAL PRIMARY KEY,
  initiator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_offer_id INTEGER NOT NULL REFERENCES skill_offers(id) ON DELETE CASCADE,
  initiator_skill_offered TEXT NOT NULL,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'scheduled', 'completed')),
  proposed_slots TEXT[] DEFAULT '{}',
  initiator_slot_choice TEXT,
  receiver_slot_choice TEXT,
  meet_link    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- NOTES TABLE
CREATE TABLE IF NOT EXISTS notes (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  subject      TEXT NOT NULL,
  tutor_name   TEXT,
  gig_id       INTEGER REFERENCES gigs(id) ON DELETE SET NULL,
  content_url  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_gigs_tutor_id ON gigs(tutor_id);
CREATE INDEX IF NOT EXISTS idx_gigs_subject ON gigs(subject);
CREATE INDEX IF NOT EXISTS idx_gigs_is_active ON gigs(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_gig_id ON bookings(gig_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_offers_user_id ON skill_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_skillswap_requests_initiator_id ON skillswap_requests(initiator_id);
CREATE INDEX IF NOT EXISTS idx_skillswap_requests_receiver_id ON skillswap_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
