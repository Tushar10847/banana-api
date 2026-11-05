/**
 * CIS046-3 Software For Enterprise
 * THEME 4: VIRTUAL IDENTITY
 * 
 * Manages player profiles, custom avatars, bio updates, and match history.
 */

const { db } = require('../database/db');
const { AVATAR_PRESETS } = require('./authController');

async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const stats = await db.getUserStats(userId);
    const history = await db.getUserGameHistory(userId, 10);

    const totalAttempts = (stats?.correct_answers || 0) + (stats?.incorrect_answers || 0);
    const winRate = totalAttempts > 0 ? Number(((stats.correct_answers / totalAttempts) * 100).toFixed(1)) : 0;

    return res.json({
      success: true,
      profile: {
        ...user,
        stats: {
          ...stats,
          winRate
        },
        recentGames: history
      }
    });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { avatar, bio } = req.body;

    if (avatar && !AVATAR_PRESETS.includes(avatar)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid avatar chosen. Please select from available presets.'
      });
    }

    if (bio && bio.length > 250) {
      return res.status(400).json({
        success: false,
        message: 'Bio cannot exceed 250 characters.'
      });
    }

    const updated = await db.updateUserProfile(userId, { avatar, bio });
    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

async function getAvailableAvatars(req, res) {
  return res.json({
    success: true,
    avatars: AVATAR_PRESETS
  });
}

module.exports = {
  getProfile,
  updateProfile,
  getAvailableAvatars
};
