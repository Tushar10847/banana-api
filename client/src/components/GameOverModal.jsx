import React from 'react';
import { Trophy, RotateCcw, Award, User, Target } from 'lucide-react';
import { sound } from '../services/audio';

export default function GameOverModal({ isOpen, stats, onRestart, onViewLeaderboard, onViewProfile }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-center">
        {/* Big Trophy / Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 animate-bounce">
          🏆
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4">
          Game Over!
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Great effort! Here is your performance summary:
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Session Score
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {stats.score}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Puzzles Solved
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {stats.roundsSolved}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Accuracy Rate
            </span>
            <div className="text-2xl font-black text-cyan-400 mt-1">
              {stats.accuracy}%
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Hints Used
            </span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {stats.hintsUsed}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onViewLeaderboard();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onViewProfile();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>View Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
