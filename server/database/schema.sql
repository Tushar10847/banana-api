-- ====================================================================
-- CIS046-3 Software For Enterprise - The Banana Game Database Schema
-- Focus Themes: Virtual Identity, Interoperability, Data Integrity
-- ====================================================================

CREATE DATABASE IF NOT EXISTS banana_game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banana_game_db;

-- 1. Users Table (Virtual Identity Core)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(100) DEFAULT '🍌 Banana King',
    bio VARCHAR(255) DEFAULT 'Ready to solve banana equations!',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. User Statistics Table (Leaderboard & Profile Analytics)
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_high_score (high_score DESC),
    INDEX idx_total_score (total_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Game Rounds Table (Active Session Security - Prevents Data Leaks)
CREATE TABLE IF NOT EXISTS active_rounds (
    round_id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    question_url VARCHAR(255) NOT NULL,
    encrypted_solution VARCHAR(255) NOT NULL,
    hints_used INT DEFAULT 0,
    status ENUM('active', 'solved', 'failed', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_round_user (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Game History Table (Match Logs & Audit Trail)
CREATE TABLE IF NOT EXISTS game_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score INT NOT NULL,
    rounds_completed INT DEFAULT 0,
    hints_used INT DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0.00,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_history_user (user_id, played_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
