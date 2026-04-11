--
-- PostgreSQL database dump
--

\restrict 8aPXHFTx8iLdEQ3s4Gyz7pVGWKblXaJKLdPN8O7AKezPzNXZ2DmIjTU10LfLAD4

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: peergig
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    gig_id integer NOT NULL,
    student_id integer NOT NULL,
    scheduled_at timestamp with time zone,
    status text DEFAULT 'pending'::text,
    meet_link text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT bookings_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text])))
);


ALTER TABLE public.bookings OWNER TO peergig;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: peergig
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO peergig;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peergig
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: gigs; Type: TABLE; Schema: public; Owner: peergig
--

CREATE TABLE public.gigs (
    id integer NOT NULL,
    tutor_id integer NOT NULL,
    title text NOT NULL,
    description text,
    subject text NOT NULL,
    price_per_session numeric(8,2) DEFAULT 0 NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.gigs OWNER TO peergig;

--
-- Name: gigs_id_seq; Type: SEQUENCE; Schema: public; Owner: peergig
--

CREATE SEQUENCE public.gigs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gigs_id_seq OWNER TO peergig;

--
-- Name: gigs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peergig
--

ALTER SEQUENCE public.gigs_id_seq OWNED BY public.gigs.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: peergig
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO peergig;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: peergig
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO peergig;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peergig
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notes; Type: TABLE; Schema: public; Owner: peergig
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    subject text NOT NULL,
    tutor_name text,
    content_url text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notes OWNER TO peergig;

--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: peergig
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notes_id_seq OWNER TO peergig;

--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peergig
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: skill_offers; Type: TABLE; Schema: public; Owner: peergig
--

CREATE TABLE public.skill_offers (
    id integer NOT NULL,
    user_id integer NOT NULL,
    skill_have text NOT NULL,
    skill_want text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.skill_offers OWNER TO peergig;

--
-- Name: skill_offers_id_seq; Type: SEQUENCE; Schema: public; Owner: peergig
--

CREATE SEQUENCE public.skill_offers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skill_offers_id_seq OWNER TO peergig;

--
-- Name: skill_offers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peergig
--

ALTER SEQUENCE public.skill_offers_id_seq OWNED BY public.skill_offers.id;


--
-- Name: skillswap_requests; Type: TABLE; Schema: public; Owner: peergig
--

CREATE TABLE public.skillswap_requests (
    id integer NOT NULL,
    initiator_id integer NOT NULL,
    receiver_id integer NOT NULL,
    skill_offer_id integer NOT NULL,
    initiator_skill_offered text NOT NULL,
    status text DEFAULT 'pending'::text,
    proposed_slots text[] DEFAULT '{}'::text[],
    initiator_slot_choice text,
    receiver_slot_choice text,
    meet_link text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT skillswap_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'scheduled'::text, 'completed'::text])))
);


ALTER TABLE public.skillswap_requests OWNER TO peergig;

--
-- Name: skillswap_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: peergig
--

CREATE SEQUENCE public.skillswap_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skillswap_requests_id_seq OWNER TO peergig;

--
-- Name: skillswap_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peergig
--

ALTER SEQUENCE public.skillswap_requests_id_seq OWNED BY public.skillswap_requests.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: peergig
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'student'::text NOT NULL,
    avatar_url text,
    bio text,
    rating numeric(3,2) DEFAULT 0,
    total_earned numeric(10,2) DEFAULT 0,
    swap_credits integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK ((role = 'student'::text))
);


ALTER TABLE public.users OWNER TO peergig;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: peergig
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO peergig;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peergig
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: peergig
--

CREATE TABLE public.wallet_transactions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    type text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT wallet_transactions_type_check CHECK ((type = ANY (ARRAY['credit'::text, 'debit'::text])))
);


ALTER TABLE public.wallet_transactions OWNER TO peergig;

--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: peergig
--

CREATE SEQUENCE public.wallet_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallet_transactions_id_seq OWNER TO peergig;

--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peergig
--

ALTER SEQUENCE public.wallet_transactions_id_seq OWNED BY public.wallet_transactions.id;


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: gigs id; Type: DEFAULT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.gigs ALTER COLUMN id SET DEFAULT nextval('public.gigs_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: skill_offers id; Type: DEFAULT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.skill_offers ALTER COLUMN id SET DEFAULT nextval('public.skill_offers_id_seq'::regclass);


--
-- Name: skillswap_requests id; Type: DEFAULT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.skillswap_requests ALTER COLUMN id SET DEFAULT nextval('public.skillswap_requests_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wallet_transactions id; Type: DEFAULT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.wallet_transactions ALTER COLUMN id SET DEFAULT nextval('public.wallet_transactions_id_seq'::regclass);


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: peergig
--

COPY public.bookings (id, gig_id, student_id, scheduled_at, status, meet_link, created_at) FROM stdin;
1	1	2	2026-04-06 18:03:38.707761+00	confirmed	https://meet.google.com/abc-defg-hij	2026-04-06 17:03:38.707761+00
2	2	2	2026-04-07 17:03:38.707761+00	pending	\N	2026-04-06 17:03:38.707761+00
3	3	2	2026-04-06 17:14:00+00	pending	\N	2026-04-06 17:12:16.114344+00
4	8	2	2026-04-24 09:38:00+00	pending	\N	2026-04-10 07:35:04.111618+00
\.


--
-- Data for Name: gigs; Type: TABLE DATA; Schema: public; Owner: peergig
--

COPY public.gigs (id, tutor_id, title, description, subject, price_per_session, tags, is_active, created_at) FROM stdin;
1	1	Mastering React Hooks & State Management	Deep-dive into useState, useEffect, useReducer, useContext, and custom hooks. Perfect for students who know basic React and want to level up.	Computer Science	1499.00	{React,JavaScript,Frontend}	t	2026-04-06 17:03:38.687678+00
2	1	Data Structures & Algorithms Bootcamp	Comprehensive DSA sessions covering arrays, linked lists, trees, graphs, sorting and dynamic programming. Interview prep focused.	Computer Science	2499.00	{DSA,Python,"Interview Prep"}	t	2026-04-06 17:03:38.687678+00
3	1	Multivariable Calculus: Vector Fields	Clear explanations of gradient, divergence, curl, line integrals, and surface integrals. University exam preparation.	Mathematics	999.00	{Calculus,Math,University}	t	2026-04-06 17:03:38.687678+00
4	1	SEO Fundamentals: Zero to Ranking	Learn keyword research, on-page SEO, backlink strategy, and how to use Google Search Console. Practical and hands-on.	Marketing	799.00	{SEO,Marketing,Digital}	t	2026-04-06 17:03:38.687678+00
5	1	Character Design for Games with Procreate	Create compelling game characters from concept to final export. Covers anatomy, color theory, and digital painting workflows.	Digital Arts	1799.00	{Design,Procreate,"Game Art"}	t	2026-04-06 17:03:38.687678+00
6	2	Class 12 Physics: Electrostatics Made Easy	Struggling with Coulomb's law, electric fields, and capacitors? I break it down simply with solved examples and quick tricks for board exams.	Physics	599.00	{Physics,"Class 12",JEE,NEET}	t	2026-04-06 17:03:38.700726+00
7	2	Vedic Maths Shortcuts for Competitive Exams	Speed up your calculations for CAT, GMAT, and other aptitude tests using Vedic Maths techniques.	Mathematics	799.00	{Maths,CAT,GMAT,Aptitude}	t	2026-04-06 17:03:38.700726+00
8	1	testing 1	xyz	Computer Science	69.00	{abc,def,"Level: Intermediate","Time: 45 mins"}	t	2026-04-10 07:34:15.730791+00
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: peergig
--

COPY public.messages (id, sender_id, receiver_id, content, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: peergig
--

COPY public.notes (id, user_id, title, subject, tutor_name, content_url, created_at) FROM stdin;
1	1	Advanced Thermodynamics Formulas	Physics	Alex M.	\N	2026-04-10 07:54:32.320878+00
2	2	React Hooks Masterclass	CS	Sarah K.	\N	2026-04-10 07:54:32.320878+00
3	2	chess openings	Chess	Myself	\N	2026-04-10 08:00:46.132575+00
\.


--
-- Data for Name: skill_offers; Type: TABLE DATA; Schema: public; Owner: peergig
--

COPY public.skill_offers (id, user_id, skill_have, skill_want, description, is_active, created_at) FROM stdin;
1	1	Python & Data Science	Figma	Intermediate (Working Knowledge) || Complete Beginner || I can help you learn Python arrays and pandas. I want to learn Figma from scratch, maybe design a landing page.	t	2026-04-06 17:03:38.738513+00
2	2	Digital Marketing	React.js and Tailwind	Advanced (Industry Pro) || Casual Knowledge || Will teach SEO and PPC. Need help getting started with modern React hooks.	t	2026-04-06 17:03:38.738513+00
3	1	System Design	DevOps & Docker	Expert (Senior) || Casual Knowledge || I can cover large scale system design. Need someone to show me how to properly set up Docker pipelines.	t	2026-04-06 17:03:38.738513+00
\.


--
-- Data for Name: skillswap_requests; Type: TABLE DATA; Schema: public; Owner: peergig
--

COPY public.skillswap_requests (id, initiator_id, receiver_id, skill_offer_id, initiator_skill_offered, status, proposed_slots, initiator_slot_choice, receiver_slot_choice, meet_link, created_at) FROM stdin;
1	2	1	1	UI Design (Figma) - I can help with your landing page!	pending	{}	\N	\N	\N	2026-04-06 17:03:38.743705+00
2	1	2	2	React.js and Tailwind hooks Masterclass	accepted	{2023-11-20T10:00:00Z,2023-11-21T14:30:00Z,2023-11-22T09:00:00Z}	\N	\N	\N	2026-04-06 17:03:38.751002+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: peergig
--

COPY public.users (id, name, email, role, avatar_url, bio, rating, total_earned, swap_credits, created_at) FROM stdin;
1	Arjun Mehta	student1@peergig.com	student	https://lh3.googleusercontent.com/aida-public/AB6AXuBLGFj3bFY26EelUWXNFUFVCj3rV7dseE-nG46kvlzbh0hQj_MW-kBUrlBRipo_WQqH3i0wRVg-RecKEHz9ouDcKYuKopt8ZkftCW5lVfNhAMXKIuCuhRoZu4JdGzO-Mq4B6euGNwZgz2CNIoQqqn9oA0X9ATu9bA2tQX5Wj3naOSGNn4vmvxmfHUdsjzktlcXAVi6evVjg7tKA7wofXxOBeoGUI1aJicEu-zuBeozCH2TopgagBaVU0MmtNDTghpU6c976tYBrkJ0	Final year CS student at IIT Delhi. Strong in DSA, React and system design. Love teaching what I know!	4.90	38868.00	20	2026-04-06 17:03:38.654985+00
2	Priya Sharma	student2@peergig.com	student	https://lh3.googleusercontent.com/aida-public/AB6AXuAkDgGbD1vPmNA7mjkFoI1W1VDDj5Fa2UKVUSuybzRbkisulSDYHvdyyQwZlIi5kU2atWO_jfcxAp5M2A4jl7GTzcFdIM1eNIxvAGs44GSNwsEkBKX6sl6rMVEuiuMZeOukVOHhYtrGPHI8Jvuypz8B6bMbzZSE7qaDSEcilbd6syMS8ZiDOg-rjes_oEHEGYKEf_cePi2pRt1_es20UPgxk47clUv2nZy6Rj0NgxYlQWPHFKp0SZJVqkpn47zWfd400ka8wYhyAyI	B.Tech 3rd year, loves learning new technologies. Also teaches Maths and Physics to juniors!	4.70	12000.00	25	2026-04-06 17:03:38.654985+00
\.


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: peergig
--

COPY public.wallet_transactions (id, user_id, amount, type, description, created_at) FROM stdin;
1	1	1499.00	credit	Earned: Mastering React Hooks session with Priya Sharma	2026-04-06 17:03:38.723324+00
2	1	2499.00	credit	Earned: Data Structures & Algorithms session with Rohan K.	2026-04-06 17:03:38.723324+00
3	1	8300.00	credit	Earned: React Hooks Bootcamp (5 sessions)	2026-04-06 17:03:38.723324+00
4	1	1499.00	credit	Earned: React Hooks session with Sneha M.	2026-04-06 17:03:38.723324+00
5	1	4998.00	credit	Earned: DSA Sessions (2 sessions)	2026-04-06 17:03:38.723324+00
6	1	20000.00	debit	Withdrawal to HDFC Bank ****4201	2026-04-06 17:03:38.723324+00
7	2	10000.00	credit	Added via UPI ΓÇö PhonePe	2026-04-06 17:03:38.73306+00
8	2	1499.00	debit	Paid: Mastering React Hooks session with Arjun Mehta	2026-04-06 17:03:38.73306+00
9	2	2499.00	debit	Paid: Data Structures & Algorithms session with Arjun Mehta	2026-04-06 17:03:38.73306+00
10	2	5000.00	credit	Added via UPI ΓÇö GPay	2026-04-06 17:03:38.73306+00
11	2	999.00	credit	Earned: Electrostatics session with Vikram R.	2026-04-06 17:03:38.73306+00
12	2	599.00	credit	Earned: Electrostatics session with Aisha T.	2026-04-06 17:03:38.73306+00
13	2	999.00	debit	Paid: Multivariable Calculus: Vector Fields with Arjun Mehta	2026-04-06 17:12:16.210785+00
14	1	999.00	credit	Earned: Multivariable Calculus: Vector Fields with Priya Sharma	2026-04-06 17:12:16.220405+00
15	2	69.00	debit	Paid: testing 1 with Arjun Mehta	2026-04-10 07:35:04.123192+00
16	1	69.00	credit	Earned: testing 1 with Priya Sharma	2026-04-10 07:35:04.131689+00
\.


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peergig
--

SELECT pg_catalog.setval('public.bookings_id_seq', 4, true);


--
-- Name: gigs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peergig
--

SELECT pg_catalog.setval('public.gigs_id_seq', 8, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peergig
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peergig
--

SELECT pg_catalog.setval('public.notes_id_seq', 3, true);


--
-- Name: skill_offers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peergig
--

SELECT pg_catalog.setval('public.skill_offers_id_seq', 3, true);


--
-- Name: skillswap_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peergig
--

SELECT pg_catalog.setval('public.skillswap_requests_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peergig
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peergig
--

SELECT pg_catalog.setval('public.wallet_transactions_id_seq', 16, true);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: gigs gigs_pkey; Type: CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.gigs
    ADD CONSTRAINT gigs_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: skill_offers skill_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.skill_offers
    ADD CONSTRAINT skill_offers_pkey PRIMARY KEY (id);


--
-- Name: skillswap_requests skillswap_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.skillswap_requests
    ADD CONSTRAINT skillswap_requests_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_gig_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_gig_id_fkey FOREIGN KEY (gig_id) REFERENCES public.gigs(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: gigs gigs_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.gigs
    ADD CONSTRAINT gigs_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notes notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: skill_offers skill_offers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.skill_offers
    ADD CONSTRAINT skill_offers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: skillswap_requests skillswap_requests_initiator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.skillswap_requests
    ADD CONSTRAINT skillswap_requests_initiator_id_fkey FOREIGN KEY (initiator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: skillswap_requests skillswap_requests_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.skillswap_requests
    ADD CONSTRAINT skillswap_requests_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: skillswap_requests skillswap_requests_skill_offer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.skillswap_requests
    ADD CONSTRAINT skillswap_requests_skill_offer_id_fkey FOREIGN KEY (skill_offer_id) REFERENCES public.skill_offers(id) ON DELETE CASCADE;


--
-- Name: wallet_transactions wallet_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peergig
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 8aPXHFTx8iLdEQ3s4Gyz7pVGWKblXaJKLdPN8O7AKezPzNXZ2DmIjTU10LfLAD4

