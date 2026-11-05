/**
 * CIS046-3 Software For Enterprise
 * THEME 2: EVENT-DRIVEN PROGRAMMING & THEME 3: INTEROPERABILITY
 * 
 * Game Controller - Orchestrates game rounds, 3-step hint requests,
 * and secure answer validation without leaking the answer to the client.
 */

const bananaService = require('../services/bananaService');
const { db } = require('../database/db');

// In-memory active round cache for ultra-low latency & database persistence
const activeRoundsCache = new Map();

async function startRound(req, res) {
  try {
    const userId = req.user.id;

    // 1. Interoperability: Fetch puzzle from Marc Conrad's Banana API
    const puzzle = await bananaService.fetchNewPuzzle();

    // 2. Data Leak Prevention:
    // Store solution strictly on the server (in memory cache & database)
    const roundData = {
      round_id: puzzle.roundId,
      user_id: userId,
      question_url: puzzle.questionUrl,
      raw_solution: puzzle.rawSolution, // HIDDEN FROM CLIENT
      encrypted_solution: puzzle.encryptedSolution,
      hints_used: 0,
      hints_revealed: [],
      start_time: Date.now()
    };

    activeRoundsCache.set(puzzle.roundId, roundData);
    await db.saveRound(roundData);

    // 3. Return sanitized response to client (ZERO SOLUTION EXPOSURE)
    return res.json({
      success: true,
      roundId: puzzle.roundId,
      questionUrl: puzzle.questionUrl,
      hintsAvailable: [1, 2, 3],
      hintsUsedCount: 0
    });
  } catch (error) {
    console.error('startRound error:', error);
    return res.status(500).json({ success: false, message: 'Failed to start game round.' });
  }
}

async function requestHint(req, res) {
  try {
    const userId = req.user.id;
    const { roundId, step } = req.body;

    if (!roundId || !step || step < 1 || step > 3) {
      return res.status(400).json({
        success: false,
        message: 'Valid roundId and hint step (1, 2, or 3) are required.'
      });
    }

    let round = activeRoundsCache.get(roundId);
    if (!round) {
      round = await db.getRound(roundId);
    }

    if (!round || round.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Active round not found or expired.'
      });
    }

    if (round.status && round.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This round has already concluded.'
      });
    }

    // Generate safe hint based on server solution
    const hintData = bananaService.generateHint(step, round.raw_solution);

    // Track hints used
    round.hints_used = (round.hints_used || 0) + 1;
    if (!round.hints_revealed) round.hints_revealed = [];
    if (!round.hints_revealed.includes(step)) {
      round.hints_revealed.push(step);
    }
    activeRoundsCache.set(roundId, round);
    await db.incrementRoundHints(roundId);

    return res.json({
      success: true,
      hint: hintData,
      totalHintsUsed: round.hints_used
    });
  } catch (error) {
    console.error('requestHint error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate hint.' });
  }
}

async function submitAnswer(req, res) {
  try {
    const userId = req.user.id;
    const { roundId, guess, timeTakenSeconds = 5 } = req.body;

    if (roundId === undefined || guess === undefined) {
      return res.status(400).json({
        success: false,
        message: 'RoundId and guess are required.'
      });
    }

    let round = activeRoundsCache.get(roundId);
    if (!round) {
      round = await db.getRound(roundId);
    }

    if (!round || round.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Active round not found.'
      });
    }

    if (round.status && round.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This round has already been submitted.'
      });
    }

    const actualSolution = parseInt(round.raw_solution, 10);
    const userGuess = parseInt(guess, 10);
    const isCorrect = userGuess === actualSolution;

    let pointsAwarded = 0;
    const hintsCount = round.hints_used || 0;

    if (isCorrect) {
      // Point Calculation System:
      // Base: 100 pts
      // Speed bonus: up to +50 pts if answered fast (< 10 seconds)
      // Hint deduction: -15 pts per hint used (minimum 25 pts awarded)
      const basePoints = 100;
      const speedBonus = Math.max(0, Math.floor((15 - Math.min(15, timeTakenSeconds)) * 3.3));
      const hintDeduction = hintsCount * 15;
      pointsAwarded = Math.max(25, basePoints + speedBonus - hintDeduction);

      await db.closeRound(roundId, 'solved');
      activeRoundsCache.delete(roundId);

      const updatedStats = await db.updateUserStats(userId, {
        scoreDelta: pointsAwarded,
        isCorrect: true,
        hintsUsedDelta: hintsCount
      });

      return res.json({
        success: true,
        correct: true,
        userGuess,
        solution: actualSolution,
        pointsAwarded,
        speedBonus,
        hintDeduction,
        stats: updatedStats,
        message: `Excellent! You solved the puzzle and earned ${pointsAwarded} points!`
      });
    } else {
      // Incorrect guess:
      // Penalty, streak reset, life lost
      await db.closeRound(roundId, 'failed');
      activeRoundsCache.delete(roundId);

      const updatedStats = await db.updateUserStats(userId, {
        scoreDelta: 0,
        isCorrect: false,
        hintsUsedDelta: hintsCount
      });

      return res.json({
        success: true,
        correct: false,
        userGuess,
        solution: actualSolution,
        pointsAwarded: 0,
        stats: updatedStats,
        message: `Oops! Incorrect answer. The correct number was ${actualSolution}.`
      });
    }
  } catch (error) {
    console.error('submitAnswer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process answer.' });
  }
}

async function finishGameSession(req, res) {
  try {
    const userId = req.user.id;
    const { finalScore = 0, roundsCompleted = 0, hintsUsed = 0, accuracy = 0 } = req.body;

    // Record match to game_history
    await db.recordGameMatch({
      userId,
      score: finalScore,
      roundsCompleted,
      hintsUsed,
      accuracy
    });

    // Mark 1 game played in user_stats
    const updatedStats = await db.updateUserStats(userId, {
      scoreDelta: 0,
      isCorrect: false,
      hintsUsedDelta: 0,
      isGameOver: true
    });

    return res.json({
      success: true,
      message: 'Game session saved to leaderboard history!',
      stats: updatedStats
    });
  } catch (error) {
    console.error('finishGameSession error:', error);
    return res.status(500).json({ success: false, message: 'Failed to finish game session.' });
  }
}

module.exports = {
  startRound,
  requestHint,
  submitAnswer,
  finishGameSession
};
