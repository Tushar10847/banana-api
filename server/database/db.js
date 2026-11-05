const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let pool = null;
let useFallback = false;

// Fallback JSON storage path
const DATA_FILE = path.join(__dirname, 'fallback_data.json');

// Initial seed data for fallback mode
const initialFallbackData = {
  users: [
    {
      id: 1,
      username: 'BananaMaster',
      email: 'master@banana.uob',
      password_hash: bcrypt.hashSync('Password123!', 10),
      avatar: '🍌 Banana King',
      bio: 'Undefeated banana mathematician!',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      username: 'ChimpChampion',
      email: 'chimp@banana.uob',
      password_hash: bcrypt.hashSync('Password123!', 10),
      avatar: '🐒 Cheeky Monkey',
      bio: 'Solving bananas at light speed!',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      username: 'JungleQueen',
      email: 'queen@banana.uob',
      password_hash: bcrypt.hashSync('Password123!', 10),
      avatar: '👑 Gold Banana',
      bio: 'All bananas belong in my basket.',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      username: 'TropicThinker',
      email: 'tropic@banana.uob',
      password_hash: bcrypt.hashSync('Password123!', 10),
      avatar: '🌴 Jungle Explorer',
      bio: 'Calculating formulas under palm trees.',
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      username: 'ByteMonkey',
      email: 'byte@banana.uob',
      password_hash: bcrypt.hashSync('Password123!', 10),
      avatar: '⚡ Speed Chimp',
      bio: 'Event-driven banana processor.',
      created_at: new Date().toISOString()
    }
  ],
  user_stats: [
    { user_id: 1, high_score: 1450, total_score: 4820, games_played: 18, correct_answers: 48, incorrect_answers: 4, hints_used: 3, current_streak: 7, best_streak: 12 },
    { user_id: 2, high_score: 1280, total_score: 3950, games_played: 15, correct_answers: 41, incorrect_answers: 6, hints_used: 5, current_streak: 4, best_streak: 9 },
    { user_id: 3, high_score: 1120, total_score: 3100, games_played: 12, correct_answers: 33, incorrect_answers: 5, hints_used: 4, current_streak: 3, best_streak: 8 },
    { user_id: 4, high_score: 940, total_score: 2400, games_played: 10, correct_answers: 25, incorrect_answers: 7, hints_used: 6, current_streak: 2, best_streak: 6 },
    { user_id: 5, high_score: 780, total_score: 1890, games_played: 8, correct_answers: 20, incorrect_answers: 8, hints_used: 7, current_streak: 1, best_streak: 5 }
  ],
  active_rounds: {},
  game_history: []
};

function loadFallbackData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialFallbackData, null, 2));
      return initialFallbackData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading fallback JSON:', err);
    return initialFallbackData;
  }
}

function saveFallbackData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing fallback JSON:', err);
  }
}

let memoryData = loadFallbackData();

async function initDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banana_game_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  try {
    // Attempt root connection to create DB if needed
    const tempConn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4;`);
    await tempConn.end();

    // Now establish connection pool with the target database
    pool = mysql.createPool(dbConfig);
    const [test] = await pool.query('SELECT 1 + 1 AS result');
    console.log(`[DATABASE] Connected to MySQL database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);

    // Auto-create tables if they don't exist
    await createTablesIfNotExist();
    useFallback = false;
  } catch (err) {
    console.warn(`[DATABASE NOTICE] MySQL not reachable at ${dbConfig.host}:${dbConfig.port} (${err.code || err.message}).`);
    console.warn('[DATABASE NOTICE] Running in Resilient Fallback Mode with persistent storage. All Game, Leaderboard, and Profile functions remain fully active.');
    useFallback = true;
  }
}

async function createTablesIfNotExist() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      avatar VARCHAR(100) DEFAULT '🍌 Banana King',
      bio VARCHAR(255) DEFAULT 'Ready to solve banana equations!',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_stats (
      user_id INT PRIMARY KEY,
      high_score INT DEFAULT 0,
      total_score INT DEFAULT 0,
      games_played INT DEFAULT 0,
      correct_answers INT DEFAULT 0,
      incorrect_answers INT DEFAULT 0,
      hints_used INT DEFAULT 0,
      current_streak INT DEFAULT 0,
      best_streak INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS active_rounds (
      round_id VARCHAR(64) PRIMARY KEY,
      user_id INT NOT NULL,
      question_url VARCHAR(255) NOT NULL,
      encrypted_solution VARCHAR(255) NOT NULL,
      hints_used INT DEFAULT 0,
      status ENUM('active', 'solved', 'failed', 'expired') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      score INT NOT NULL,
      rounds_completed INT DEFAULT 0,
      hints_used INT DEFAULT 0,
      accuracy DECIMAL(5,2) DEFAULT 0.00,
      played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Check if users exist, otherwise insert seeds
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users');
  if (rows[0].count === 0) {
    console.log('[DATABASE] Seeding initial leaderboard players into MySQL...');
    for (const u of initialFallbackData.users) {
      await pool.query(
        'INSERT INTO users (id, username, email, password_hash, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)',
        [u.id, u.username, u.email, u.password_hash, u.avatar, u.bio]
      );
    }
    for (const s of initialFallbackData.user_stats) {
      await pool.query(
        'INSERT INTO user_stats (user_id, high_score, total_score, games_played, correct_answers, incorrect_answers, hints_used, current_streak, best_streak) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.user_id, s.high_score, s.total_score, s.games_played, s.correct_answers, s.incorrect_answers, s.hints_used, s.current_streak, s.best_streak]
      );
    }
  }
}

// Data Access Layer (DAL) Methods
const db = {
  isUsingFallback: () => useFallback,

  // --- Users ---
  async findUserByUsername(username) {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    }
    return memoryData.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  async findUserByEmail(email) {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    }
    return memoryData.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?', [id]);
      return rows[0] || null;
    }
    const user = memoryData.users.find(u => u.id === parseInt(id, 10));
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async createUser({ username, email, password_hash, avatar = '🍌 Banana King', bio = 'Ready to solve banana equations!' }) {
    if (!useFallback && pool) {
      const [res] = await pool.query(
        'INSERT INTO users (username, email, password_hash, avatar, bio) VALUES (?, ?, ?, ?, ?)',
        [username, email, password_hash, avatar, bio]
      );
      const newUserId = res.insertId;
      await pool.query(
        'INSERT INTO user_stats (user_id, high_score, total_score, games_played, correct_answers, incorrect_answers, hints_used, current_streak, best_streak) VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0)',
        [newUserId]
      );
      return { id: newUserId, username, email, avatar, bio };
    }

    const nextId = memoryData.users.length ? Math.max(...memoryData.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: nextId,
      username,
      email,
      password_hash,
      avatar,
      bio,
      created_at: new Date().toISOString()
    };
    memoryData.users.push(newUser);
    memoryData.user_stats.push({
      user_id: nextId,
      high_score: 0,
      total_score: 0,
      games_played: 0,
      correct_answers: 0,
      incorrect_answers: 0,
      hints_used: 0,
      current_streak: 0,
      best_streak: 0
    });
    saveFallbackData(memoryData);
    return { id: nextId, username, email, avatar, bio };
  },

  async updateUserProfile(userId, { avatar, bio }) {
    if (!useFallback && pool) {
      await pool.query('UPDATE users SET avatar = COALESCE(?, avatar), bio = COALESCE(?, bio) WHERE id = ?', [avatar, bio, userId]);
      return this.findUserById(userId);
    }
    const u = memoryData.users.find(x => x.id === parseInt(userId, 10));
    if (u) {
      if (avatar !== undefined) u.avatar = avatar;
      if (bio !== undefined) u.bio = bio;
      saveFallbackData(memoryData);
    }
    return this.findUserById(userId);
  },

  // --- User Stats & Analytics ---
  async getUserStats(userId) {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
      return rows[0] || null;
    }
    return memoryData.user_stats.find(s => s.user_id === parseInt(userId, 10)) || null;
  },

  async updateUserStats(userId, { scoreDelta = 0, isCorrect = false, hintsUsedDelta = 0, isGameOver = false }) {
    const stats = await this.getUserStats(userId);
    if (!stats) return null;

    let {
      high_score = 0,
      total_score = 0,
      games_played = 0,
      correct_answers = 0,
      incorrect_answers = 0,
      hints_used = 0,
      current_streak = 0,
      best_streak = 0
    } = stats;

    total_score = Math.max(0, total_score + scoreDelta);
    hints_used += hintsUsedDelta;

    if (isCorrect) {
      correct_answers += 1;
      current_streak += 1;
      if (current_streak > best_streak) {
        best_streak = current_streak;
      }
    } else {
      incorrect_answers += 1;
      current_streak = 0;
    }

    if (scoreDelta > 0 && total_score > high_score) {
      high_score = total_score;
    }

    if (isGameOver) {
      games_played += 1;
    }

    if (!useFallback && pool) {
      await pool.query(`
        UPDATE user_stats
        SET high_score = ?, total_score = ?, games_played = ?, correct_answers = ?, incorrect_answers = ?, hints_used = ?, current_streak = ?, best_streak = ?
        WHERE user_id = ?
      `, [high_score, total_score, games_played, correct_answers, incorrect_answers, hints_used, current_streak, best_streak, userId]);
    } else {
      const idx = memoryData.user_stats.findIndex(s => s.user_id === parseInt(userId, 10));
      if (idx !== -1) {
        memoryData.user_stats[idx] = {
          user_id: parseInt(userId, 10),
          high_score,
          total_score,
          games_played,
          correct_answers,
          incorrect_answers,
          hints_used,
          current_streak,
          best_streak
        };
        saveFallbackData(memoryData);
      }
    }

    return {
      high_score,
      total_score,
      games_played,
      correct_answers,
      incorrect_answers,
      hints_used,
      current_streak,
      best_streak
    };
  },

  // --- Leaderboard ---
  async getLeaderboard(limit = 10) {
    if (!useFallback && pool) {
      const [rows] = await pool.query(`
        SELECT 
          u.id,
          u.username,
          u.avatar,
          u.bio,
          s.high_score,
          s.total_score,
          s.games_played,
          s.correct_answers,
          s.incorrect_answers,
          s.best_streak,
          CASE 
            WHEN (s.correct_answers + s.incorrect_answers) > 0 
            THEN ROUND((s.correct_answers / (s.correct_answers + s.incorrect_answers)) * 100, 1)
            ELSE 0 
          END AS win_rate
        FROM users u
        JOIN user_stats s ON u.id = s.user_id
        ORDER BY s.high_score DESC, s.total_score DESC, win_rate DESC
        LIMIT ?
      `, [limit]);
      return rows;
    }

    const merged = memoryData.users.map(u => {
      const s = memoryData.user_stats.find(stat => stat.user_id === u.id) || {
        high_score: 0,
        total_score: 0,
        games_played: 0,
        correct_answers: 0,
        incorrect_answers: 0,
        best_streak: 0
      };
      const totalAttempts = s.correct_answers + s.incorrect_answers;
      const win_rate = totalAttempts > 0 ? Number(((s.correct_answers / totalAttempts) * 100).toFixed(1)) : 0;
      return {
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio,
        high_score: s.high_score,
        total_score: s.total_score,
        games_played: s.games_played,
        correct_answers: s.correct_answers,
        incorrect_answers: s.incorrect_answers,
        best_streak: s.best_streak,
        win_rate
      };
    });

    merged.sort((a, b) => b.high_score - a.high_score || b.total_score - a.total_score);
    return merged.slice(0, limit);
  },

  // --- Active Game Rounds (Anti-Cheat & Data Leak Protection) ---
  async saveRound(roundData) {
    if (!useFallback && pool) {
      await pool.query(
        'INSERT INTO active_rounds (round_id, user_id, question_url, encrypted_solution, hints_used, status) VALUES (?, ?, ?, ?, ?, ?)',
        [roundData.round_id, roundData.user_id, roundData.question_url, roundData.encrypted_solution, roundData.hints_used || 0, 'active']
      );
      return;
    }
    memoryData.active_rounds[roundData.round_id] = {
      ...roundData,
      status: 'active',
      created_at: new Date().toISOString()
    };
    saveFallbackData(memoryData);
  },

  async getRound(roundId) {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM active_rounds WHERE round_id = ?', [roundId]);
      return rows[0] || null;
    }
    return memoryData.active_rounds[roundId] || null;
  },

  async closeRound(roundId, status = 'solved') {
    if (!useFallback && pool) {
      await pool.query('UPDATE active_rounds SET status = ? WHERE round_id = ?', [status, roundId]);
      return;
    }
    if (memoryData.active_rounds[roundId]) {
      memoryData.active_rounds[roundId].status = status;
      saveFallbackData(memoryData);
    }
  },

  async incrementRoundHints(roundId) {
    if (!useFallback && pool) {
      await pool.query('UPDATE active_rounds SET hints_used = hints_used + 1 WHERE round_id = ?', [roundId]);
      return;
    }
    if (memoryData.active_rounds[roundId]) {
      memoryData.active_rounds[roundId].hints_used = (memoryData.active_rounds[roundId].hints_used || 0) + 1;
      saveFallbackData(memoryData);
    }
  },

  // --- Match History ---
  async recordGameMatch({ userId, score, roundsCompleted, hintsUsed, accuracy }) {
    if (!useFallback && pool) {
      await pool.query(
        'INSERT INTO game_history (user_id, score, rounds_completed, hints_used, accuracy) VALUES (?, ?, ?, ?, ?)',
        [userId, score, roundsCompleted, hintsUsed, accuracy]
      );
      return;
    }
    memoryData.game_history.unshift({
      id: memoryData.game_history.length + 1,
      user_id: userId,
      score,
      rounds_completed: roundsCompleted,
      hints_used: hintsUsed,
      accuracy,
      played_at: new Date().toISOString()
    });
    saveFallbackData(memoryData);
  },

  async getUserGameHistory(userId, limit = 5) {
    if (!useFallback && pool) {
      const [rows] = await pool.query(
        'SELECT * FROM game_history WHERE user_id = ? ORDER BY played_at DESC LIMIT ?',
        [userId, limit]
      );
      return rows;
    }
    return memoryData.game_history
      .filter(h => h.user_id === parseInt(userId, 10))
      .slice(0, limit);
  }
};

module.exports = {
  initDatabase,
  db
};
