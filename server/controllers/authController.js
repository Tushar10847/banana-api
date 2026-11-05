/**
 * CIS046-3 Software For Enterprise
 * THEME 4: VIRTUAL IDENTITY
 * 
 * Manages user registration, authentication, password hashing with bcrypt,
 * and stateless JWT issuance.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const AVATAR_PRESETS = [
  '🍌 Banana King',
  '🐒 Cheeky Monkey',
  '👑 Gold Banana',
  '🌴 Jungle Explorer',
  '⚡ Speed Chimp',
  '🧠 Puzzle Master'
];

async function register(req, res) {
  try {
    const { username, email, password, avatar = '🍌 Banana King', bio } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required.'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check existing username
    const existingUser = await db.findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken by another player.'
      });
    }

    // Check existing email
    const existingEmail = await db.findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered.'
      });
    }

    // Hash password with 10 salt rounds
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const chosenAvatar = AVATAR_PRESETS.includes(avatar) ? avatar : AVATAR_PRESETS[0];

    const newUser = await db.createUser({
      username,
      email,
      password_hash,
      avatar: chosenAvatar,
      bio: bio || 'Ready to solve banana equations!'
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const stats = await db.getUserStats(newUser.id);

    return res.status(201).json({
      success: true,
      message: 'Virtual Identity created successfully! Welcome to The Banana Game.',
      token,
      user: newUser,
      stats
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
}

async function login(req, res) {
  try {
    const { identifier, password } = req.body; // username or email

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/Email and password are required.'
      });
    }

    // Find by username or email
    let user = await db.findUserByUsername(identifier);
    if (!user) {
      user = await db.findUserByEmail(identifier);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    // Compare bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    const stats = await db.getUserStats(user.id);

    return res.json({
      success: true,
      message: 'Authenticated successfully!',
      token,
      user: safeUser,
      stats
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
}

async function getMe(req, res) {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const stats = await db.getUserStats(req.user.id);
    return res.json({
      success: true,
      user,
      stats
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  AVATAR_PRESETS
};
