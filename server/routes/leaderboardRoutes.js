const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

// Publicly readable dynamic leaderboard
router.get('/', leaderboardController.getLeaderboard);

module.exports = router;
