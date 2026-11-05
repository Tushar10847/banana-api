import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/audio';
import { Trophy, RefreshCw, Flame, Target, Database, Award } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageEngine, setStorageEngine] = useState('');
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getLeaderboard(15);
      if (data.success) {
        setLeaders(data.leaderboard);
        setStorageEngine(data.storageEngine);
      }
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-500/20 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
              🏆
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                Chimp Championship Leaderboard
              </h2>
              <p className="text-xs text-slate-400">
                Live rankings generated dynamically from database queries (no hardcoding).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>{storageEngine || 'MySQL Active'}</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              fetchLeaderboard();
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3.5 text-center w-16">Rank</th>
                <th scope="col" className="px-4 py-3.5">Player / Virtual Identity</th>
                <th scope="col" className="px-4 py-3.5 text-right">High Score</th>
                <th scope="col" className="px-4 py-3.5 text-right hidden sm:table-cell">Total Score</th>
                <th scope="col" className="px-4 py-3.5 text-center hidden md:table-cell">Win Rate</th>
                <th scope="col" className="px-4 py-3.5 text-center hidden sm:table-cell">Best Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && leaders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 text-xs">
                    <div className="w-8 h-8 mx-auto border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
                    Querying live rankings...
                  </td>
                </tr>
              ) : leaders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400 text-sm">
                    No leaderboard scores recorded yet. Be the first to play!
                  </td>
                </tr>
              ) : (
                leaders.map((player) => {
                  const isCurrent = user && player.id === user.id;

                  // Rank Badge styling
                  let rankDisplay = `#${player.rank}`;
                  let rankBg = 'bg-slate-800 text-slate-400';
                  if (player.rank === 1) {
                    rankDisplay = '🥇 1st';
                    rankBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black';
                  } else if (player.rank === 2) {
                    rankDisplay = '🥈 2nd';
                    rankBg = 'bg-slate-400/20 text-slate-200 border border-slate-400/40 font-black';
                  } else if (player.rank === 3) {
                    rankDisplay = '🥉 3rd';
                    rankBg = 'bg-amber-700/20 text-amber-500 border border-amber-700/40 font-black';
                  }

                  return (
                    <tr
                      key={player.id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-amber-500/10 font-bold border-l-4 border-amber-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${rankBg}`}>
                          {rankDisplay}
                        </span>
                      </td>

                      {/* Player Avatar & Username */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{player.avatar?.split(' ')[0] || '🍌'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {player.username}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                              &ldquo;{player.bio}&rdquo;
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* High Score */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-base font-black text-amber-400">
                          {player.highScore}
                        </span>
                        <span className="text-[10px] text-slate-500 block">pts</span>
                      </td>

                      {/* Total Score */}
                      <td className="px-4 py-4 text-right hidden sm:table-cell text-slate-300 font-semibold">
                        {player.totalScore}
                      </td>

                      {/* Win Rate */}
                      <td className="px-4 py-4 text-center hidden md:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          {player.winRate}%
                        </span>
                      </td>

                      {/* Best Streak */}
                      <td className="px-4 py-4 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-400 font-bold">
                          <Flame className="w-3.5 h-3.5 fill-current" />
                          <span>{player.bestStreak}x</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
