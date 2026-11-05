import React from 'react';
import { HelpCircle, X, Sparkles, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { sound } from '../services/audio';

export default function HintModal({ isOpen, onClose, hintsRevealed = {}, onUnlockHint, loading }) {
  if (!isOpen) return null;

  const hintSteps = [
    {
      step: 1,
      title: 'Step 1: Parity Clue',
      description: 'Reveals whether the hidden number is Even or Odd.',
      cost: 15,
      revealed: !!hintsRevealed[1],
      data: hintsRevealed[1]
    },
    {
      step: 2,
      title: 'Step 2: Range Restriction',
      description: 'Narrows the possible number down to a 5-digit bounded span.',
      cost: 25,
      revealed: !!hintsRevealed[2],
      data: hintsRevealed[2]
    },
    {
      step: 3,
      title: 'Step 3: Super Elimination',
      description: 'Wipes out 8 wrong numbers, leaving only 2 candidate digits on the keypad!',
      cost: 35,
      revealed: !!hintsRevealed[3],
      data: hintsRevealed[3]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl shadow-amber-500/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                3-Step Hint Oracle
              </h3>
              <p className="text-xs text-slate-400">
                Unlock progressive mathematical clues (point deductions apply).
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hints List */}
        <div className="mt-5 space-y-4">
          {hintSteps.map((h, idx) => {
            const isPrevUnlocked = idx === 0 || hintSteps[idx - 1].revealed;
            const canUnlock = !h.revealed && isPrevUnlocked;

            return (
              <div
                key={h.step}
                className={`p-4 rounded-xl border transition-all ${
                  h.revealed
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : canUnlock
                    ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-900/40 border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                      {h.step}
                    </span>
                    <h4 className="font-semibold text-sm text-slate-200">
                      {h.title}
                    </h4>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    -{h.cost} pts
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1 pl-8">
                  {h.description}
                </p>

                {/* Revealed clue message */}
                {h.revealed ? (
                  <div className="mt-3 pl-8">
                    <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{h.data.clue}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pl-8 flex justify-end">
                    <button
                      type="button"
                      disabled={!canUnlock || loading}
                      onClick={() => onUnlockHint(h.step)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        canUnlock
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      }`}
                    >
                      {canUnlock ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Unlock Clue (-{h.cost} pts)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock Step {h.step - 1} First</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Eliminated digits will automatically lock on the keypad.</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-3 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
