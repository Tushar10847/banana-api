# 🎓 CIS046-3 Software For Enterprise — 10-Minute Video Presentation Guide
### Target Grade: 70%+ (1st Class Honours)
**Artifact**: The Banana Game (Enterprise Full-Stack System)  
**Stack**: MySQL, Express.js, React (Vite, Tailwind CSS), Node.js, Web Audio API  
**Interoperability**: Marc Conrad's Banana Web Service (`https://marcconrad.com/uob/banana/api.php?out=json`)

---

## ⏱️ Suggested 10-Minute Video Breakdown

| Timestamp | Topic | Visual on Screen |
|-----------|-------|------------------|
| **0:00 - 1:30** | **System Demonstration** | Live gameplay: login, banana puzzle, timer, 3-step hints, vibration shake on error, confetti on victory, dynamic leaderboard, profile customization |
| **1:30 - 3:30** | **Theme 1: Version Control & Architecture** | Codebase folder structure, modularity (Controllers, Services, Routes, DAL), branch strategy, commit granularity |
| **3:30 - 5:30** | **Theme 2: Event-Driven Programming** | React Synthetic Events (`onClick`, `onKeyDown`), Web Audio API tone synthesis, countdown timer interval events, async event loop |
| **5:30 - 7:45** | **Theme 3: Interoperability & Data Leak Prevention** | Third-party Banana API integration via Axios, REST/JSON contract, proxy pattern to hide solutions from DevTools inspection |
| **7:45 - 9:30** | **Theme 4: Virtual Identity & Security** | User registration, bcrypt 10-round password hashing, JWT stateless authentication, MySQL user stats, dynamic leaderboard |
| **9:30 - 10:00** | **Evaluation & Conclusion** | Critical reflection, scalability, future enterprise enhancements |

---

## 🎯 Theme-by-Theme Rubric Defenses (For 70%+ 1st Class)

### 1. Version Control & Component Architecture
* **Rubric Requirement (70%+)**: *Critically evaluate code structure into components, alternative approaches, and reflect on version control strategies (branching, tagging, code reviews).*
* **What to Highlight in Video**:
  - **Modular Architecture**: Separate `client/` and `server/` trees.
  - **Service & DAL Layers**: The backend follows an enterprise MVC pattern:
    * `services/bananaService.js`: Encapsulates third-party communication.
    * `database/db.js`: Encapsulates the MySQL connection pool and resilient fallback.
    * `middleware/authMiddleware.js`: Separates authentication concerns.
  - **Component Reusability in React**:
    * `GameBoard.jsx`: State machine managing lives, streaks, and round flow.
    * `Keypad.jsx`: Reusable numerical keypad with hint-driven button elimination.
    * `HintModal.jsx`: 3-Step hint oracle.
  - **Version Control Reflection**:
    * Git branching strategy (e.g., `main`, `feature/banana-api-proxy`, `feature/hint-oracle`, `feature/auth-jwt`).
    * Atomic commit granularity ensuring peer review capability and rollback safety.

---

### 2. Event-Driven Programming
* **Rubric Requirement (70%+)**: *Confidently reflect on how events are generated and handled, justifying the approach taken.*
* **What to Highlight in Video**:
  - **Multi-Modal Input Events**:
    * Show `client/src/components/Keypad.jsx`: Global keyboard event listener (`window.addEventListener('keydown', handleKeyDown)`) allowing players to type numbers 0-9 directly.
    * React Synthetic Mouse & Touch Events (`onClick`, `onSubmit`).
  - **Temporal & Lifecycle Events**:
    * `setInterval` countdown event generating 1-second ticks for the round timer.
    * Timeout trigger event causing life loss and screen shake.
  - **Synthesized Audio Events (Web Audio API)**:
    * Show `client/src/services/audio.js`: Instead of heavy static audio files, oscillators generate dynamic sound frequencies (C5-E5-G5 arpeggios on correct; 150Hz-90Hz dissonance on error).
  - **Animation Feedback Events**:
    * `@keyframes vibrationShake`: 0.6s shaking vibration event triggered upon wrong answer.
    * Confetti particle physics event triggered upon correct answer.

---

### 3. Interoperability & Data Leak Prevention
* **Rubric Requirement (70%+)**: *Critically justify approaches taken to include third-party software, such as a web service, into your application.*
* **What to Highlight in Video**:
  - **External API Consumption**:
    * Communicates with Marc Conrad's Banana API (`https://marcconrad.com/uob/banana/api.php?out=json`) using HTTP GET.
  - **The Critical Security Dilemma (Data Leak Prevention)**:
    * *Explain to the marker*: The remote Banana API returns both `{ question, solution }`.
    * If the React frontend called the API directly, any user could open Chrome DevTools (F12) -> Network tab and view the answer!
    * **Enterprise Gateway Solution**: Our Express server acts as a secure intermediary proxy. It captures the answer, computes hints, and relays **only** the `questionUrl` to the browser. The actual answer is validated strictly server-side.
  - **3-Step Hint Interoperability**:
    * Server-side algorithmic clues: Step 1 (Parity / Even-Odd), Step 2 (Bounded Range), Step 3 (False Choice Elimination).

---

### 4. Virtual Identity & Authentication
* **Rubric Requirement (70%+)**: *Critically discuss authentication mechanisms used to establish virtual identity, role in security, and alternative approaches.*
* **What to Highlight in Video**:
  - **Virtual Identity**:
    * A player cannot play as an anonymous entity without identity; they must log in to establish their virtual identity.
    * Each identity has persistent metadata: custom avatar persona, bio, high score, total points, and games played.
  - **Security Implementation**:
    * **Password Hashing**: Bcrypt with 10 salt rounds (never stored in plaintext).
    * **Stateless JWTs**: Signed with a secure secret key, passed in `Authorization: Bearer <token>` headers.
    * **Database Protection**: Parameterized SQL queries using `mysql2/promise` to eliminate SQL injection vectors.
  - **Dynamic Leaderboard**:
    * Unlike static mocks, the leaderboard dynamically sorts MySQL records by `high_score DESC, win_rate DESC`, providing true competitive rankings.

---

## 🎙️ Sample Script for System Demo (First 90 Seconds)

> *"Hello, this is my video submission for CIS046-3 Software For Enterprise. Today I will present The Banana Game, an enterprise full-stack web application built using React, Node.js, Express, and MySQL, interoperating with Dr. Marc Conrad's Banana Web Service.*  
>  
> *Notice that to play the game, I must first establish a Virtual Identity. I will log in using our verified user account.  
> As the game begins, our backend contacts the remote Banana API, retrieves the equation puzzle, and securely caches the solution server-side. Notice the visual countdown timer.  
> If I enter an incorrect answer—such as pressing 9 when the answer is not 9—watch the card: it vibrates with an authentic shaking animation, accompanied by an audio buzzer, and a life is deducted.  
> If I am stuck on a puzzle, I can open our 3-Step Hint Oracle: Step 1 reveals the parity (Even or Odd), Step 2 narrows the numerical range, and Step 3 eliminates incorrect choices directly on our interactive keypad.  
> When I submit the correct answer, notice the celebratory confetti, green glow, audio chime, and bonus points added to my profile.  
> Finally, navigating to the Leaderboard displays live rankings calculated directly from our MySQL database, and the Profile section allows avatar customization and match auditing."*
