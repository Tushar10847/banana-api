/**
 * CIS046-3 Software For Enterprise
 * Dynamic Leaderboard Controller
 * 
 * Retrieves dynamic ranking data from MySQL based on actual player game scores.
 * No hardcoded rankings.
 */

const { db } = require('../database/db');

async function getLeaderboard(req, res) {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const leaders = await db.getLeaderboard(limit);

    // Format with competitive ranks & awards
    const rankedData = leaders.map((player, index) => {
      let badge = null;
      if (index === 0) badge = '👑 1st (Grand Champion)';
      else if (index === 1) badge = '🥈 2nd (Silver Banana)';
      else if (index === 2) badge = '🥉 3rd (Bronze Chimp)';

      return {
        rank: index + 1,
        id: player.id,
        username: player.username,
        avatar: player.avatar,
        bio: player.bio,
        highScore: player.high_score,
        totalScore: player.total_score,
        gamesPlayed: player.games_played,
        winRate: player.win_rate,
        bestStreak: player.best_streak,
        badge
      };
    });

    return res.json({
      success: true,
      count: rankedData.length,
      leaderboard: rankedData,
      storageEngine: db.isUsingFallback() ? 'Resilient Adapter' : 'MySQL Database'
    });
  } catch (error) {
    console.error('getLeaderboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch leaderboard.' });
  }
}

module.exports = {
  getLeaderboard
};
