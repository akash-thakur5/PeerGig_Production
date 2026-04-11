# 🎓 PeerGig — Peer-to-Peer Tutoring Marketplace

[![Framework](https://img.shields.io/badge/Framework-Next.js%2016-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Payments](https://img.shields.io/badge/Payments-Razorpay-orange?style=flat-square&logo=razorpay)](https://razorpay.com/)
[![Video](https://img.shields.io/badge/Video-Jitsi%20Meet-brightgreen?style=flat-square&logo=dynamic)](https://meet.jit.si/)

**PeerGig** is a full-stack peer-to-peer tutoring platform that empowers students to learn from each other. Built for hackathons and scalability, it features a robust escrow payment system, live video conferencing, and a unique skill-swapping barter economy.

---

## 🚀 Key Features

### 💰 Secure Razorpay Escrow
- **Student Protection**: Payments are held by the platform until the tutor accepts the booking.
- **Auto-Refunds**: Instant, automatic refunds to the student's wallet if a tutor rejects or cancels.
- **Micro-transactions**: Optimized for affordable peer sessions (₹49 - ₹149).

### 📹 Professional Live Meetings
- **Built-in Jitsi Integration**: No external links required.
- **Lobby Experience**: Pre-join screen with live camera/mic preview and device status checks.
- **Encrypted Rooms**: Unique, private meeting rooms generated for every confirmed session.

### 🔄 SkillSwap (Barter System)
- **Zero-Cost Learning**: Propose and accept skill exchanges without spending money.
- **Dual Economy**: Earn "Swap Credits" through activity to use for future learning.

### 👛 Digital Wallet
- **Real-time Balance**: Automated credit/debit tracking.
- **Transaction History**: Transparent logs for payments, earnings, and refunds.

### 🎯 Marketplace & Tutoring
- **Gig Wizard**: 2-step setup for tutors to define subjects, pricing, and timing slots.
- **Smart Discovery**: Filter by subject, price, language, and rating.
- **Status Badges**: Real-time status updates (Pending, Confirmed, Completed).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Vanilla CSS (Modern Design System), CSS Variables
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL (Relational schema with cascade integrity)
- **Infrastructure**: Docker for database containerization
- **Third-Party APIs**: 
  - **Razorpay**: For multi-channel payment processing.
  - **Jitsi Meet**: For secure, embedded video conferencing.

---

## ⚙️ Local Setup

1. **Clone the repository**:
   ```bash
   git clone <YOUR_REPO_URL>
   cd PeerGig
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://peergig:peergig@localhost:5432/peergig
   
   # Razorpay (Test Mode)
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
   
   # App URL
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Spin up the Database**:
   ```bash
   docker-compose up -d
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```

6. **Access the platform**:
   Open [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

- `/src/app`: Next.js App Router (Pages & API Routes)
- `/src/components`: Reusable UI components
- `/public`: Static assets
- `/db`: SQL initialization and database backups

---

## 📜 License
This project is open-source and available under the MIT License.
