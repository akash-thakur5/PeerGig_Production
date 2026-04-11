# PeerGig: Complete Project Overview & Technical Documentation

This document serves as the single source of truth for the PeerGig project. It provides a comprehensive breakdown of the core concepts, technical architecture, API structure, and the current state of development to ensure seamless continuity in future work sessions.

---

## 1. Core Vision & Concepts
**PeerGig** is a decentralized academic marketplace and knowledge-exchange platform where students can learn from each other through two primary mechanisms:

### A. The Gig Economy (Monetized Learning)
- **Tutors**: Students with expertise in a subject post "Gigs" with a set price per session (in **INR ₹**).
- **Students**: Search for topics and book sessions using their wallet balance.
- **Economic Loop**: Gigs generate revenue for tutors and platform cut.

### B. The Skillswap (Knowledge Trade)
- **Concept**: A pure trade of knowledge between two peers (e.g., "I teach you React, you teach me UI Design").
- **Swap Credits**: To maintain the Gig economy, Skillswaps are regulated by a credit system.
    - **Earning**: Users earn **5 Swap Credits** for every paid Gig session they attend.
    - **Spending**: Initiating or completing one Skillswap trade costs **10 Swap Credits**.
- **Motivation**: This ensures users participate in the paid ecosystem to "unlock" the ability to trade skills for free.

---

## 2. Technical Stack
- **Frontend**: Next.js 15+ (App Router).
- **Styling**: Tailwind CSS v4 (with custom `@theme` tokens in `globals.css`).
- **Icons**: [Material Symbols Outlined](https://fonts.google.com/icons) (Standardized to Weight `300`).
- **Database**: [Neon Serverless PostgreSQL](https://neon.tech/).
- **Database Driver**: `postgres` (Serverless-safe JS client).
- **Authentication**: Demo Session Auth (Custom middleware + Cookie-based strategy in `src/lib/demo-auth.ts`).

---

## 3. Database Schema (Conceptual)
The database resides on Neon and follows this relational structure:
- **`users`**: `id`, `name`, `email`, `avatar_url`, `bio`, `wallet_balance`, `swap_credits`.
- **`gigs`**: `id`, `tutor_id`, `title`, `subject`, `description`, `price_per_session`, `is_active`.
- **`bookings`**: `id`, `gig_id`, `student_id`, `scheduled_at`, `status` (pending/confirmed), `meet_link`.
- **`messages`**: `id`, `sender_id`, `receiver_id`, `content`, `created_at`.
- **`wallet_transactions`**: `id`, `user_id`, `amount`, `type` (credit/debit), `description`.
- **`skillswap_requests`**: `id`, `sender_id`, `receiver_id`, `status` (pending/accepted/rejected).

---

## 4. API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/me` | GET | Returns the currently logged-in user session. |
| `/api/users/me` | GET/PATCH | Fetches/Updates the current user's profile and stats (Earned, Gigs). |
| `/api/gigs` | GET | Lists available gigs with search (`?q=`) and subject filters. |
| `/api/gigs` | POST | Creates a new tutoring gig for the current user. |
| `/api/bookings` | GET | Lists current user's learning bookings (Incoming & Outgoing). |
| `/api/wallet` | GET | Fetches wallet balance and transaction history. |
| `/api/wallet/add` | POST | Mock endpoint to add funds to the wallet. |
| `/api/messages` | GET | Lists all active conversation threads for the user. |
| `/api/messages?to=id` | GET | Fetches the full chat history with a specific peer. |
| `/api/messages` | POST | Sends a message to a peer. |
| `/api/skillswaps` | GET | Fetches current swap credit balance and active requests. |

---

## 5. Frontend: Page Status & Dynamics

### ✅ Fully Dynamic (Connected to DB)
- **`/dashboard`**: Unified landing for users; shows greeting, balance, and upcoming sessions.
- **`/student`**: Searchable gig marketplace with live data.
- **`/tutor`**: Tutor portal showing stats and the list of active gigs.
- **`/wallet`**: Transactional interface with live balance updates.
- **`/messages`**: Real-time chat threads and inbox.
- **`/profile`**: Full user profile rendering with editing capabilities.
- **`/connect`**: Lists peers available for connections/swaps.
- **`/skillswap`**: Functional market for browsing swap opportunities.

### ⚠️ Partially Static / Needs Refinement
- **`/search`**: Needs advanced filtering (Price range, Tutor rating).
- **`/history`**: Learning history list (currently simplistic).
- **`/notes`**: Placeholder for the student's study materials.
- **`/tutor/create`**: The multi-step gig creation wizard (needs final validation logic).

---

## 6. Directory Roadmap
- `src/app/`: The core route handlers and UI pages.
- `src/components/`: Reusable UI elements:
    - `TopNavBar.tsx`: Unified glassmorphism header.
    - `Sidebar.tsx`: Global navigation and Logout.
- `src/lib/`: Core utilities:
    - `db.ts`: Neon PostgreSQL client initialization.
    - `demo-auth.ts`: Session management.
- `src/app/api/`: Backend serverless functions grouped by resource.

---

## 7. Key Design Constants (Consistency Guide)
- **Primary Color**: `#904d00` (Amber Deep).
- **Secondary Color**: `#5f5e61` (Neutral Grey).
- **Background**: `#fbf8fc` (Soft White).
- **Icon Style**: Material Symbols Outlined, Weight `300`.
- **Top Offset**: Main content always requires `pt-16` to stay below the fixed `TopNavBar`.
- **Sidebar Width**: Standardized at `64` (`w-64`).

---
*Documentation generated on April 6, 2026. This file should be updated after every major feature merge.*
