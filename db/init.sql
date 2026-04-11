-- ============================================================
-- PeerGig Database Schema + Seed Data
-- On PeerGig, EVERYONE is a student — you can earn by teaching
-- and learn from other students. No separate tutor/student roles.
-- All prices are in INR (₹).
-- ============================================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
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

-- SKILL OFFERS TABLE (reserved for Skillswap feature)
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

CREATE TABLE IF NOT EXISTS notes (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  subject      TEXT NOT NULL,
  tutor_name   TEXT,
  content_url  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Demo Users (IDs match DEMO_USERS in src/lib/demo-auth.ts)
-- Student 1: Arjun Mehta — teaches CS topics, has some wallet balance
-- Student 2: Priya Sharma — books sessions, has topped up wallet
INSERT INTO users (id, name, email, role, avatar_url, bio, rating, total_earned, swap_credits) VALUES
(1, 'Arjun Mehta', 'student1@peergig.com', 'student',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLGFj3bFY26EelUWXNFUFVCj3rV7dseE-nG46kvlzbh0hQj_MW-kBUrlBRipo_WQqH3i0wRVg-RecKEHz9ouDcKYuKopt8ZkftCW5lVfNhAMXKIuCuhRoZu4JdGzO-Mq4B6euGNwZgz2CNIoQqqn9oA0X9ATu9bA2tQX5Wj3naOSGNn4vmvxmfHUdsjzktlcXAVi6evVjg7tKA7wofXxOBeoGUI1aJicEu-zuBeozCH2TopgagBaVU0MmtNDTghpU6c976tYBrkJ0',
 'Final year CS student at IIT Delhi. Strong in DSA, React and system design. Love teaching what I know!', 4.9, 37800.00, 20),
(2, 'Priya Sharma', 'student2@peergig.com', 'student',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkDgGbD1vPmNA7mjkFoI1W1VDDj5Fa2UKVUSuybzRbkisulSDYHvdyyQwZlIi5kU2atWO_jfcxAp5M2A4jl7GTzcFdIM1eNIxvAGs44GSNwsEkBKX6sl6rMVEuiuMZeOukVOHhYtrGPHI8Jvuypz8B6bMbzZSE7qaDSEcilbd6syMS8ZiDOg-rjes_oEHEGYKEf_cePi2pRt1_es20UPgxk47clUv2nZy6Rj0NgxYlQWPHFKp0SZJVqkpn47zWfd400ka8wYhyAyI',
 'B.Tech 3rd year, loves learning new technologies. Also teaches Maths and Physics to juniors!', 4.7, 12000.00, 15)
ON CONFLICT (id) DO UPDATE SET
  name       = EXCLUDED.name,
  email      = EXCLUDED.email,
  role       = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url,
  bio        = EXCLUDED.bio,
  rating     = EXCLUDED.rating,
  total_earned = EXCLUDED.total_earned,
  swap_credits = EXCLUDED.swap_credits;

-- Reset sequence to avoid PK conflicts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Sample Gigs (posted by Arjun, id=1 — he teaches these topics)
INSERT INTO gigs (tutor_id, title, description, subject, price_per_session, tags, timing_slots) VALUES
(1, 'Mastering React Hooks & State Management',
 'Deep-dive into useState, useEffect, useReducer, useContext, and custom hooks. Perfect for students who know basic React and want to level up.',
 'Computer Science', 1499.00, ARRAY['React', 'JavaScript', 'Frontend'], ARRAY['10:00 AM - 11:00 AM', '4:00 PM - 5:00 PM']),

(1, 'Data Structures & Algorithms Bootcamp',
 'Comprehensive DSA sessions covering arrays, linked lists, trees, graphs, sorting and dynamic programming. Interview prep focused.',
 'Computer Science', 2499.00, ARRAY['DSA', 'Python', 'Interview Prep'], ARRAY['10:00 AM - 11:00 AM', '4:00 PM - 5:00 PM']),

(1, 'Multivariable Calculus: Vector Fields',
 'Clear explanations of gradient, divergence, curl, line integrals, and surface integrals. University exam preparation.',
 'Mathematics', 999.00, ARRAY['Calculus', 'Math', 'University'], ARRAY['10:00 AM - 11:00 AM', '4:00 PM - 5:00 PM']),

(1, 'SEO Fundamentals: Zero to Ranking',
 'Learn keyword research, on-page SEO, backlink strategy, and how to use Google Search Console. Practical and hands-on.',
 'Marketing', 799.00, ARRAY['SEO', 'Marketing', 'Digital'], ARRAY['10:00 AM - 11:00 AM', '4:00 PM - 5:00 PM']),

(1, 'Character Design for Games with Procreate',
 'Create compelling game characters from concept to final export. Covers anatomy, color theory, and digital painting workflows.',
 'Digital Arts', 1799.00, ARRAY['Design', 'Procreate', 'Game Art'], ARRAY['10:00 AM - 11:00 AM', '4:00 PM - 5:00 PM']);

-- Sample Gig posted by Priya (id=2 — she teaches Maths)
INSERT INTO gigs (tutor_id, title, description, subject, price_per_session, tags, timing_slots) VALUES
(2, 'Class 12 Physics: Electrostatics Made Easy',
 'Struggling with Coulomb''s law, electric fields, and capacitors? I break it down simply with solved examples and quick tricks for board exams.',
 'Physics', 599.00, ARRAY['Physics', 'Class 12', 'JEE', 'NEET'], ARRAY['10:00 AM - 11:00 AM', '4:00 PM - 5:00 PM']),

(2, 'Vedic Maths Shortcuts for Competitive Exams',
 'Speed up your calculations for CAT, GMAT, and other aptitude tests using Vedic Maths techniques.',
 'Mathematics', 799.00, ARRAY['Maths', 'CAT', 'GMAT', 'Aptitude'], ARRAY['10:00 AM - 11:00 AM', '4:00 PM - 5:00 PM']);

-- Sample Bookings (Priya id=2 booking from Arjun id=1)
INSERT INTO bookings (gig_id, student_id, scheduled_at, status, meet_link) VALUES
(1, 2, NOW() + INTERVAL '1 hour', 'confirmed', 'https://meet.google.com/abc-defg-hij'),
(2, 2, NOW() + INTERVAL '1 day', 'pending', NULL);

-- Wallet Transactions for Arjun (earned from teaching)
-- Credits appear when his gigs are booked
INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES
(1, 1499.00, 'credit', 'Earned: Mastering React Hooks session with Priya Sharma'),
(1, 2499.00, 'credit', 'Earned: Data Structures & Algorithms session with Rohan K.'),
(1, 8300.00, 'credit', 'Earned: React Hooks Bootcamp (5 sessions)'),
(1, 1499.00, 'credit', 'Earned: React Hooks session with Sneha M.'),
(1, 4998.00, 'credit', 'Earned: DSA Sessions (2 sessions)'),
(1, 20000.00, 'debit', 'Withdrawal to HDFC Bank ****4201');

-- Wallet for Priya (topped up + spent on learning)
INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES
(2, 10000.00, 'credit', 'Added via UPI — PhonePe'),
(2, 1499.00,  'debit',  'Paid: Mastering React Hooks session with Arjun Mehta'),
(2, 2499.00,  'debit',  'Paid: Data Structures & Algorithms session with Arjun Mehta'),
(2, 5000.00,  'credit', 'Added via UPI — GPay'),
(2, 999.00,   'credit', 'Earned: Electrostatics session with Vikram R.'),
(2, 599.00,   'credit', 'Earned: Electrostatics session with Aisha T.');

-- Seed Data: Skill Offers (Marketplace)
INSERT INTO skill_offers (user_id, skill_have, skill_want, description) VALUES
(1, 'Python & Data Science', 'Figma', 'Intermediate (Working Knowledge) || Complete Beginner || I can help you learn Python arrays and pandas. I want to learn Figma from scratch, maybe design a landing page.'),
(2, 'Digital Marketing', 'React.js and Tailwind', 'Advanced (Industry Pro) || Casual Knowledge || Will teach SEO and PPC. Need help getting started with modern React hooks.'),
(1, 'System Design', 'DevOps & Docker', 'Expert (Senior) || Casual Knowledge || I can cover large scale system design. Need someone to show me how to properly set up Docker pipelines.');

-- Seed Data: Skillswap Requests (Negotiations)
-- Request 1: Pending (Student 2 asking Student 1)
INSERT INTO skillswap_requests (initiator_id, receiver_id, skill_offer_id, initiator_skill_offered, status)
VALUES (2, 1, 1, 'UI Design (Figma) - I can help with your landing page!', 'pending');

-- Request 2: Accepted (Student 1 and Student 2 matched, now they need to schedule)
INSERT INTO skillswap_requests (initiator_id, receiver_id, skill_offer_id, initiator_skill_offered, status, proposed_slots)
VALUES (1, 2, 2, 'React.js and Tailwind hooks Masterclass', 'accepted', ARRAY['2023-11-20T10:00:00Z', '2023-11-21T14:30:00Z', '2023-11-22T09:00:00Z']);

-- Seed Data: Notes
INSERT INTO notes (user_id, title, subject, tutor_name) VALUES
(1, 'Advanced Thermodynamics Formulas', 'Physics', 'Alex M.'),
(2, 'React Hooks Masterclass', 'CS', 'Sarah K.');

-- Reset sequence for notes
SELECT setval('notes_id_seq', (SELECT MAX(id) FROM notes));
