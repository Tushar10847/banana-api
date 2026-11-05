import React, { useEffect } from 'react';
import { sound } from '../services/audio';

export default function Keypad({ onSelect, disabled, eliminatedDigits = [] }) {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Event-Driven Programming: Global Keyboard Input Listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (disabled) return;
      const key = e.key;
      if (/^[0-9]$/.test(key)) {
        const num = parseInt(key, 10);
        if (!eliminatedDigits.includes(num)) {
          sound.playClick();
          onSelect(num);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, eliminatedDigits, onSelect]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="text-center mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          Select Your Answer (or press 0-9 on keyboard):
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {digits.map((digit) => {
          const isEliminated = eliminatedDigits.includes(digit);

          return (
            <button
              key={digit}
              type="button"
              disabled={disabled || isEliminated}
              onClick={() => {
                sound.playClick();
                onSelect(digit);
              }}
              className={`relative py-3 sm:py-4 rounded-xl font-black text-2xl sm:text-3xl transition-all duration-150 transform active:scale-95 flex flex-col items-center justify-center select-none shadow-lg ${
                isEliminated
                  ? 'bg-slate-900/40 text-slate-600 border border-slate-800/50 cursor-not-allowed line-through opacity-40 grayscale'
                  : 'bg-gradient-to-b from-slate-800 to-slate-900 text-amber-300 border border-amber-500/30 hover:border-amber-400 hover:from-slate-700 hover:to-slate-800 hover:shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              <span>{digit}</span>
              {isEliminated && (
                <span className="absolute top-1 right-1 text-[10px] text-rose-500 font-bold not-line-through">
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
