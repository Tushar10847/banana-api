import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/audio';
import { Trophy, User, Play, Volume2, VolumeX, LogOut, LogIn, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, stats, isAuthenticated, logout } = useAuth();
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  const handleSoundToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-amber-500/20 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('game')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            🍌
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 bg-clip-text text-transparent">
                The Banana Game
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive Mathematics & Pattern Puzzle
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('game');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'game'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('leaderboard');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              if (!isAuthenticated) {
                onOpenAuth();
              } else {
                setActiveTab('profile');
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </nav>

        {/* Right Action Bar (Sound & User Identity) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle button */}
          <button
            onClick={handleSoundToggle}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-300 hover:text-amber-400 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* User state / Virtual Identity */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-slate-800">
              <div 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-700/80 px-2.5 py-1.5 rounded-xl border border-amber-500/30 transition-all"
              >
                <span className="text-xl">{user.avatar?.split(' ')[0] || '🍌'}</span>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-200 leading-tight">
                    {user.username}
                  </div>
                  <div className="text-[10px] text-amber-400 font-medium">
                    Best: {stats?.high_score || 0} pts
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  logout();
                }}
                title="Logout Virtual Identity"
                className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAuth();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Login to Play</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
