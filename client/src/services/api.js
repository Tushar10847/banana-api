/**
 * CIS046-3 Software For Enterprise
 * REST API Client Service
 * 
 * Manages communication between React frontend and Express backend.
 * Handles token storage and error handling.
 */

const BASE_URL = '/api';

function getHeaders() {
  const token = localStorage.getItem('banana_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  async register({ username, email, password, avatar, bio }) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, avatar, bio })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async login({ identifier, password }) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch current user');
    return data;
  },

  // Leaderboard
  async getLeaderboard(limit = 10) {
    const res = await fetch(`${BASE_URL}/leaderboard?limit=${limit}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch leaderboard');
    return data;
  },

  // Profile
  async getProfile() {
    const res = await fetch(`${BASE_URL}/profile`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
  },

  async updateProfile({ avatar, bio }) {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ avatar, bio })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
  },

  async getAvailableAvatars() {
    const res = await fetch(`${BASE_URL}/profile/avatars`);
    const data = await res.json();
    return data.avatars || [];
  },

  // Game Endpoints
  async startRound() {
    const res = await fetch(`${BASE_URL}/game/start`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to start round');
    return data;
  },

  async requestHint({ roundId, step }) {
    const res = await fetch(`${BASE_URL}/game/hint`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ roundId, step })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to request hint');
    return data;
  },

  async submitAnswer({ roundId, guess, timeTakenSeconds }) {
    const res = await fetch(`${BASE_URL}/game/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ roundId, guess, timeTakenSeconds })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit answer');
    return data;
  },

  async finishGameSession({ finalScore, roundsCompleted, hintsUsed, accuracy }) {
    const res = await fetch(`${BASE_URL}/game/finish`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ finalScore, roundsCompleted, hintsUsed, accuracy })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to finish game');
    return data;
  }
};
