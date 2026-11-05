# 🍌 The Banana Game (Enterprise Edition)
### CIS046-3 Software For Enterprise — University of Bedfordshire

An enterprise full-stack mathematical pattern game built with **MySQL**, **Express**, **React**, and **Node.js**, interoperating with **Marc Conrad's Banana Web Service**.

---

## 🌟 Key Features

1. **Interoperability with Marc Conrad's Banana API**:
   - Fetches live visual math puzzles via REST (`https://marcconrad.com/uob/banana/api.php?out=json`).
   - Enterprise security architecture that **completely prevents data leaks**: the solution is stripped and secured on the backend, ensuring client inspection cannot reveal answers ahead of time.

2. **3-Step Hint Oracle**:
   - **Step 1 (Parity)**: Reveals whether the answer is Even or Odd (-15 pts).
   - **Step 2 (Range Limit)**: Restricts the digit to a bounded span (-25 pts).
   - **Step 3 (Keypad Elimination)**: Eliminates 8 incorrect choices, locking the keypad down to 2 candidate numbers (-35 pts).

3. **Dynamic MySQL Leaderboard**:
   - Real-time ranking calculated directly from database records (no hardcoded data).
   - Tracks High Score, Total Career Points, Accuracy Rate, Games Played, and Combo Streaks.

4. **Virtual Identity & Profile Management**:
   - Secure registration and login using **bcrypt** (10 salt rounds) and **JWT (JSON Web Tokens)**.
   - Profile customization: choose from 6 fun personas (🍌 Banana King, 🐒 Cheeky Monkey, 👑 Gold Banana, etc.), custom bio, and match history.

5. **Event-Driven Gameplay & Animations**:
   - **Vibration Shaking Animation (`animate-vibration`)**: Pronounced shake effect and red flash when a mistake is made.
   - **Celebratory Confetti & Green Glow**: Multi-colored confetti burst, floating `+PTS` popups, and sound chimes on correct answers.
   - **Web Audio API Sound Engine**: Zero-asset, zero-lag synthesized retro chimes, buzzers, and clicks.
   - **Dual Input Modes**: Tap 0-9 on screen or type directly on the computer keyboard!

---

## 🏗️ System Architecture

```
[ Browser / Client ] (React + Vite + Tailwind CSS)
        │
        ▼ HTTP (REST JSON) + JWT Header
[ API Gateway / Express Backend ] (Node.js :5000)
   ├── Auth Middleware (JWT Verification)
   ├── Anti-Cheat / Data-Leak Prevention Engine
   ├── 3-Step Hint Generator
   ├── Services Layer
   │       └── [ Marc Conrad Banana Web Service ] (HTTP GET)
   │
   └── Data Access Layer (DAL)
           ├── [ MySQL Database ] (InnoDB, Port 3306)
           └── [ Resilient Fallback Engine ] (Auto-active if MySQL is starting)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MySQL / XAMPP / MariaDB** (Optional, app includes auto-fallback)

### 1. Start Both Backend & Frontend
In the root directory, simply run:
```bash
node run-all.js
```
- **React Frontend**: `http://localhost:5173`
- **Express Backend**: `http://localhost:5000`
- **Backend Health Check**: `http://localhost:5000/api/health`

### 2. Instant Demo Login
If you want to test immediately without signing up:
- Click **"Login to Play"** in the top navigation.
- Click the shortcut: **"Click here for 1-Click Demo Login (BananaMaster)"**
- Password: `Password123!`

---

## 🗄️ MySQL Database Setup (Optional)
To connect your local MySQL server:
1. Open XAMPP or start MySQL on port `3306`.
2. Check `server/.env`:
   ```ini
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=banana_game_db
   ```
3. The server automatically runs `CREATE TABLE IF NOT EXISTS` and inserts initial seed leaderboard data upon startup!
   (Manual SQL script is also provided at `server/database/schema.sql`).

---

## 🛡️ CIS046-3 Academic Rubric Compliance (Four Themes)
See [`docs/CIS046-3_Video_Presentation_Guide.md`](docs/CIS046-3_Video_Presentation_Guide.md) for full video presentation scripts and technical justifications for achieving 70%+ (First Class).
