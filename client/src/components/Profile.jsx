import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { sound } from '../services/audio';
import { 
  User, 
  ShieldCheck, 
  Trophy, 
  Flame, 
  Target, 
  HelpCircle, 
  Clock, 
  Save, 
  Check, 
  Calendar,
  Award
} from 'lucide-react';

export default function Profile() {
  const { user, stats, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🍌 Banana King');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profRes, avatRes] = await Promise.all([
          api.getProfile(),
          api.getAvailableAvatars()
        ]);
        if (profRes.success) {
          setProfileData(profRes.profile);
          setSelectedAvatar(profRes.profile.avatar);
          setBio(profRes.profile.bio || '');
        }
        if (avatRes) {
          setAvatars(avatRes);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    sound.playClick();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        avatar: selectedAvatar,
        bio
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-10 h-10 mx-auto border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        Loading your Virtual Identity Profile...
      </div>
    );
  }

  const pStats = profileData?.stats || stats || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Profile Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Big Avatar */}
          <div className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-5xl shadow-xl shadow-amber-500/20 flex-shrink-0 animate-float-slow">
            {selectedAvatar.split(' ')[0]}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {user?.username}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold self-center sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Virtual Identity</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {user?.email} • Registered Player
            </p>

            <p className="text-sm text-amber-200/90 italic bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-700/50 inline-block">
              &ldquo;{bio || 'Ready to solve banana equations!'}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Career Stats Grid */}
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-400" />
        <span>Career Performance Metrics</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30">
          <span className="text-[11px] uppercase font-bold text-slate-400">High Score</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {pStats.high_score || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-yellow-500/30">
          <span className="text-[11px] uppercase font-bold text-slate-400">Total Points</span>
          <div className="text-2xl font-black text-yellow-300 mt-1">
            {pStats.total_score || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30">
          <span className="text-[11px] uppercase font-bold text-slate-400">Accuracy Rate</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {pStats.winRate || 0}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-orange-500/30">
          <span className="text-[11px] uppercase font-bold text-slate-400">Best Streak</span>
          <div className="flex items-center gap-1.5 text-2xl font-black text-orange-400 mt-1">
            <Flame className="w-5 h-5 fill-current" />
            <span>{pStats.best_streak || 0}x</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60">
          <span className="text-[11px] uppercase font-bold text-slate-400">Games Played</span>
          <div className="text-xl font-extrabold text-slate-200 mt-1">
            {pStats.games_played || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60">
          <span className="text-[11px] uppercase font-bold text-slate-400">Correct Answers</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {pStats.correct_answers || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60">
          <span className="text-[11px] uppercase font-bold text-slate-400">Mistakes</span>
          <div className="text-xl font-extrabold text-rose-400 mt-1">
            {pStats.incorrect_answers || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60">
          <span className="text-[11px] uppercase font-bold text-slate-400">Hints Consulted</span>
          <div className="text-xl font-extrabold text-purple-400 mt-1">
            {pStats.hints_used || 0}
          </div>
        </div>
      </div>

      {/* Edit Virtual Identity Card */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-400" />
          <span>Customize Virtual Identity</span>
        </h3>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 mb-2">
              Select Jungle Persona Avatar:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {avatars.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedAvatar(av);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                    selectedAvatar === av
                      ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl">{av.split(' ')[0]}</span>
                  <span className="text-xs">{av.substring(av.indexOf(' ') + 1)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bio input */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 mb-2">
              Player Motto / Bio (Max 250 characters):
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={250}
              rows={3}
              placeholder="Enter your chimp wisdom or game battlecry..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
            <div className="text-right text-[11px] text-slate-500 mt-1">
              {bio.length}/250 characters
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 animate-fadeIn">
                <Check className="w-4 h-4" />
                <span>Virtual Identity updated successfully!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Match History Table */}
      {profileData?.recentGames?.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Recent Game Sessions</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Score</th>
                  <th className="px-4 py-2.5 text-center">Puzzles Solved</th>
                  <th className="px-4 py-2.5 text-center">Accuracy</th>
                  <th className="px-4 py-2.5 text-center">Hints Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {profileData.recentGames.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(m.played_at).toLocaleDateString()} {new Date(m.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-amber-400">
                      {m.score} pts
                    </td>
                    <td className="px-4 py-3 text-center text-slate-200">
                      {m.rounds_completed}
                    </td>
                    <td className="px-4 py-3 text-center text-emerald-400 font-bold">
                      {m.accuracy}%
                    </td>
                    <td className="px-4 py-3 text-center text-purple-400">
                      {m.hints_used}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
