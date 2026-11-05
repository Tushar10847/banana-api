-- ====================================================================
-- The Banana Game - Seed Data for Leaderboard & Virtual Identity
-- Passwords are hashed with bcrypt (sample: 'Password123!')
-- ====================================================================

USE banana_game_db;

-- Insert Seed Users
INSERT INTO users (id, username, email, password_hash, avatar, bio)
VALUES
(1, 'BananaMaster', 'master@banana.uob', '$2a$10$wNnQn1g9k.CgP9fQ7F6Z4O1V2U3X4Y5Z6A7B8C9D0E1F2G3H4I5J6', '🍌 Banana King', 'Undefeated banana mathematician!'),
(2, 'ChimpChampion', 'chimp@banana.uob', '$2a$10$wNnQn1g9k.CgP9fQ7F6Z4O1V2U3X4Y5Z6A7B8C9D0E1F2G3H4I5J6', '🐒 Cheeky Monkey', 'Solving bananas at light speed!'),
(3, 'JungleQueen', 'queen@banana.uob', '$2a$10$wNnQn1g9k.CgP9fQ7F6Z4O1V2U3X4Y5Z6A7B8C9D0E1F2G3H4I5J6', '👑 Gold Banana', 'All bananas belong in my basket.'),
(4, 'TropicThinker', 'tropic@banana.uob', '$2a$10$wNnQn1g9k.CgP9fQ7F6Z4O1V2U3X4Y5Z6A7B8C9D0E1F2G3H4I5J6', '🌴 Jungle Explorer', 'Calculating formulas under palm trees.'),
(5, 'ByteMonkey', 'byte@banana.uob', '$2a$10$wNnQn1g9k.CgP9fQ7F6Z4O1V2U3X4Y5Z6A7B8C9D0E1F2G3H4I5J6', '⚡ Speed Chimp', 'Event-driven banana processor.');

-- Insert User Stats
INSERT INTO user_stats (user_id, high_score, total_score, games_played, correct_answers, incorrect_answers, hints_used, current_streak, best_streak)
VALUES
(1, 1450, 4820, 18, 48, 4, 3, 7, 12),
(2, 1280, 3950, 15, 41, 6, 5, 4, 9),
(3, 1120, 3100, 12, 33, 5, 4, 3, 8),
(4, 940, 2400, 10, 25, 7, 6, 2, 6),
(5, 780, 1890, 8, 20, 8, 7, 1, 5);
