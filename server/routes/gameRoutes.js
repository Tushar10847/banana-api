const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { requireAuth } = require('../middleware/authMiddleware');

// All game endpoints strictly protected by authentication
router.post('/start', requireAuth, gameController.startRound);
router.post('/hint', requireAuth, gameController.requestHint);
router.post('/submit', requireAuth, gameController.submitAnswer);
router.post('/finish', requireAuth, gameController.finishGameSession);

module.exports = router;
