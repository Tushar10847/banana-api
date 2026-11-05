import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import GameBoard from './components/GameBoard';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import AuthModal from './components/AuthModal';
import { Shield, GitBranch, Cpu, Radio } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('game');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* Navigation Header */}
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Main Content Area */}
        <main className="py-4 sm:py-6">
          {activeTab === 'game' && (
            <GameBoard
              onOpenAuth={() => setIsAuthOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'leaderboard' && (
            <Leaderboard />
          )}

          {activeTab === 'profile' && (
            isAuthenticated ? (
              <Profile />
            ) : (
              <div className="max-w-md mx-auto text-center py-16 px-4">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-xl font-bold text-white mb-2">Virtual Identity Required</h2>
                <p className="text-xs text-slate-400 mb-6">
                  Please log in or register to access your player profile, customize your avatar, and track career statistics.
                </p>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all"
                >
                  Login to Continue
                </button>
              </div>
            )
          )}
        </main>
      </div>

      {/* Enterprise University Footer with the 4 Core Themes */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-sm py-6 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍌</span>
            <span className="font-extrabold text-slate-200">The Banana Game</span>
            <span>• CIS046-3 Software For Enterprise</span>
          </div>

          {/* 4 Themes Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1 text-slate-300">
              <GitBranch className="w-3 h-3 text-cyan-400" />
              <span>1. Version Control</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1 text-slate-300">
              <Cpu className="w-3 h-3 text-amber-400" />
              <span>2. Event-Driven</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1 text-slate-300">
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>3. Interoperability</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1 text-slate-300">
              <Shield className="w-3 h-3 text-purple-400" />
              <span>4. Virtual Identity</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            Powered by Marc Conrad Banana Web Service
          </div>
        </div>
      </footer>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
