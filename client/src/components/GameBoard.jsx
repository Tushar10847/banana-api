import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { sound } from '../services/audio';
import Keypad from './Keypad';
import HintModal from './HintModal';
import GameOverModal from './GameOverModal';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Heart, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  ShieldCheck,
  Trophy
} from 'lucide-react';

const ROUND_TIME_LIMIT = 20; // 20 seconds per puzzle
const INITIAL_LIVES = 3;

export default function GameBoard({ onOpenAuth, onNavigateTab }) {
  const { user, stats, isAuthenticated, refreshStats } = useAuth();

  // Game state
  const [roundId, setRoundId] = useState(null);
  const [questionUrl, setQuestionUrl] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [streak, setStreak] = useState(0);
  const [roundsSolved, setRoundsSolved] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState({});
  const [eliminatedDigits, setEliminatedDigits] = useState([]);

  // Round Timer & Animation states
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_LIMIT);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false); // Vibration Shake
  const [isRedFlash, setIsRedFlash] = useState(false);
  const [isGreenGlow, setIsGreenGlow] = useState(false);
  const [floatingScore, setFloatingScore] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null); // 'correct' | 'wrong'

  // Modals
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);

  const roundStartTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Load a new Banana Puzzle from the backend
  const loadNextRound = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      setFeedbackMsg(null);
      setFeedbackType(null);
      setHintsRevealed({});
      setEliminatedDigits([]);

      const data = await api.startRound();
      if (data.success) {
        setRoundId(data.roundId);
        setQuestionUrl(data.questionUrl);
        setTimeLeft(ROUND_TIME_LIMIT);
        setIsTimerRunning(true);
        roundStartTimeRef.current = Date.now();
      }
    } catch (err) {
      console.error('Error starting round:', err);
      setFeedbackMsg({ title: 'Error', text: err.message || 'Could not load puzzle' });
      setFeedbackType('wrong');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Start initial round when authenticated
  useEffect(() => {
    if (isAuthenticated && !roundId && !isGameOverOpen) {
      loadNextRound();
    }
  }, [isAuthenticated, roundId, isGameOverOpen, loadNextRound]);

  // Event-Driven Timer: Countdown Interval
  useEffect(() => {
    if (!isTimerRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, roundId]);

  // Timeout handler
  const handleTimeOut = () => {
    sound.playWrong();
    triggerShakingVibration();
    setFeedbackType('wrong');
    setFeedbackMsg({
      title: 'Time Expired!',
      text: 'The bananas spoiled! You lost 1 life.'
    });
    handleWrongAttempt();
  };

  // Trigger vibration shaking animation
  const triggerShakingVibration = () => {
    setIsShaking(true);
    setIsRedFlash(true);
    setTimeout(() => {
      setIsShaking(false);
      setIsRedFlash(false);
    }, 650);
  };

  // Trigger celebratory confetti & green glow
  const triggerCelebration = (points) => {
    setIsGreenGlow(true);
    setFloatingScore(`+${points} PTS!`);
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.65 },
      colors: ['#facc15', '#22c55e', '#f59e0b', '#38bdf8', '#fbbf24']
    });

    setTimeout(() => {
      setIsGreenGlow(false);
    }, 800);

    setTimeout(() => {
      setFloatingScore(null);
    }, 1300);
  };

  // Handle wrong attempt logic
  const handleWrongAttempt = (solution = null) => {
    setTotalAttempts((prev) => prev + 1);
    setStreak(0);
    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      // Game Over session
      setIsTimerRunning(false);
      finishSession(score);
    } else {
      setTimeout(() => {
        loadNextRound();
      }, 1500);
    }
  };

  // Submit Answer to Backend (Validates on Server - Zero Data Leaks)
  const handleSubmitAnswer = async (guess) => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    if (isSubmitting || isLoading || !roundId) return;

    setIsSubmitting(true);
    setIsTimerRunning(false);
    clearInterval(timerRef.current);

    const timeTaken = Math.round((Date.now() - roundStartTimeRef.current) / 1000);

    try {
      const result = await api.submitAnswer({
        roundId,
        guess,
        timeTakenSeconds: timeTaken
      });

      setTotalAttempts((prev) => prev + 1);

      if (result.correct) {
        // Correct answer event!
        sound.playCorrect();
        const earned = result.pointsAwarded;
        setScore((prev) => prev + earned);
        setRoundsSolved((prev) => prev + 1);
        setStreak((prev) => prev + 1);
        triggerCelebration(earned);

        setFeedbackType('correct');
        setFeedbackMsg({
          title: `Spot on! Digit is ${result.solution}`,
          text: `+${earned} points added! (Speed bonus: +${result.speedBonus} pts)`
        });

        refreshStats();

        setTimeout(() => {
          loadNextRound();
        }, 1200);
      } else {
        // Wrong answer event!
        sound.playWrong();
        triggerShakingVibration();

        setFeedbackType('wrong');
        setFeedbackMsg({
          title: `Incorrect! You guessed ${guess}`,
          text: `The true banana equation answer was ${result.solution}. 1 Life lost!`
        });

        handleWrongAttempt(result.solution);
      }
    } catch (err) {
      console.error('Answer submission error:', err);
      sound.playWrong();
      triggerShakingVibration();
      setFeedbackType('wrong');
      setFeedbackMsg({ title: 'Error', text: err.message || 'Evaluation error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unlock 3-Step Hint
  const handleUnlockHint = async (step) => {
    if (!roundId || isLoading) return;
    try {
      setIsLoading(true);
      const res = await api.requestHint({ roundId, step });
      if (res.success && res.hint) {
        sound.playHint();
        setHintsUsedCount((prev) => prev + 1);
        setHintsRevealed((prev) => ({
          ...prev,
          [step]: res.hint
        }));

        // Merge eliminated digits
        if (res.hint.eliminatedDigits) {
          setEliminatedDigits((prev) => {
            const combined = new Set([...prev, ...res.hint.eliminatedDigits]);
            return Array.from(combined);
          });
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to unlock hint.');
    } finally {
      setIsLoading(false);
    }
  };

  // Finish session
  const finishSession = async (finalScore) => {
    sound.playGameOver();
    const attempts = totalAttempts + 1;
    const accuracy = attempts > 0 ? Math.round((roundsSolved / attempts) * 100) : 0;

    try {
      await api.finishGameSession({
        finalScore,
        roundsCompleted: roundsSolved,
        hintsUsed: hintsUsedCount,
        accuracy
      });
      refreshStats();
    } catch (e) {
      console.warn('Failed to record match session:', e);
    }

    setIsGameOverOpen(true);
  };

  // Restart new game session
  const restartGame = () => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setStreak(0);
    setRoundsSolved(0);
    setTotalAttempts(0);
    setHintsUsedCount(0);
    setHintsRevealed({});
    setEliminatedDigits([]);
    setIsGameOverOpen(false);
    loadNextRound();
  };

  // If user is not logged in, show enticing Hero Banner
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="relative inline-block mb-6">
          <div className="text-7xl animate-float-slow">🍌</div>
          <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-lg">
            CIS046-3
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4">
          The <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 bg-clip-text text-transparent">Banana Game</span>
        </h1>
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-8 font-medium">
          Test your cognitive math & pattern recognition powers! Crack Marc Conrad&apos;s tropical banana equations, climb the live MySQL leaderboard, and unlock 3-step progressive hints.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10 text-left">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-bold text-white text-sm mb-1">Anti-Cheat & No Leaks</h3>
            <p className="text-xs text-slate-400">
              Solutions are validated securely on the backend server, completely preventing client data inspection leaks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
            <div className="text-2xl mb-2">💡</div>
            <h3 className="font-bold text-white text-sm mb-1">3-Step Hint Oracle</h3>
            <p className="text-xs text-slate-400">
              Stuck on an equation? Unlock parity, range, and keypad elimination hints progressively.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-yellow-500/30">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-bold text-white text-sm mb-1">Live MySQL Leaderboard</h3>
            <p className="text-xs text-slate-400">
              Dynamic rankings computed in real time. Prove your mathematical supremacy against other chimps!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onOpenAuth();
          }}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
        >
          <Sparkles className="w-5 h-5 fill-current" />
          <span>Login or Register to Play</span>
        </button>
      </div>
    );
  }

  // Calculate timer progress bar percentage
  const timerPercentage = Math.max(0, (timeLeft / ROUND_TIME_LIMIT) * 100);
  const isTimeCritical = timeLeft <= 5;

  return (
    <div className={`relative max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 transition-all ${isRedFlash ? 'animate-red-flash' : ''} ${isGreenGlow ? 'animate-green-glow' : ''}`}>
      
      {/* Floating points score popup */}
      {floatingScore && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-2xl shadow-2xl shadow-emerald-500/50 animate-float-score border-2 border-white">
            {floatingScore}
          </div>
        </div>
      )}

      {/* Top HUD: Score, Lives, Streak, Timer, Hints Button */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {/* Score Card */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-slate-400">
              Session Score
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {score}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        {/* Lives Card */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-slate-400">
              Banana Lives
            </span>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(INITIAL_LIVES)].map((_, i) => (
                <span
                  key={i}
                  className={`text-lg sm:text-xl transition-all ${
                    i < lives ? 'scale-100 opacity-100' : 'scale-75 opacity-25 grayscale'
                  }`}
                >
                  🍌
                </span>
              ))}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <Heart className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Streak Card */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-yellow-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-slate-400">
              Combo Streak
            </span>
            <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-black text-yellow-300">
              <span>{streak}x</span>
              {streak >= 3 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold animate-pulse">
                  HOT!
                </span>
              )}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
            <Flame className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Hint Oracle Button */}
        <button
          onClick={() => {
            sound.playClick();
            setIsHintModalOpen(true);
          }}
          className="p-3 sm:p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between group transition-all"
        >
          <div className="text-left">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-slate-400 group-hover:text-emerald-300">
              3-Step Hints
            </span>
            <div className="text-xs sm:text-sm font-bold text-emerald-400">
              {Object.keys(hintsRevealed).length}/3 Unlocked
            </div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Main Puzzle Arena Card with Vibration Shaking animation on wrong answer */}
      <div 
        className={`relative bg-slate-900/90 border-2 rounded-3xl p-4 sm:p-6 shadow-2xl transition-all ${
          isShaking 
            ? 'border-rose-500 shadow-rose-500/30 animate-vibration' 
            : feedbackType === 'correct'
            ? 'border-emerald-500/60 shadow-emerald-500/20'
            : 'border-amber-500/30 shadow-amber-500/10'
        }`}
      >
        {/* Timer Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
              <span>Round Countdown</span>
            </span>
            <span className={`${isTimeCritical ? 'text-rose-400 font-black text-sm' : 'text-slate-300'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                isTimeCritical
                  ? 'bg-rose-500 animate-pulse'
                  : timeLeft <= 10
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackMsg && (
          <div
            className={`mb-4 p-3 rounded-xl border flex items-center gap-3 transition-all ${
              feedbackType === 'correct'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            {feedbackType === 'correct' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            )}
            <div>
              <div className="font-bold text-sm">{feedbackMsg.title}</div>
              <div className="text-xs opacity-90">{feedbackMsg.text}</div>
            </div>
          </div>
        )}

        {/* Banana Equation Image Container */}
        <div className="relative w-full rounded-2xl bg-slate-950/90 border border-slate-800 p-2 sm:p-4 flex items-center justify-center min-h-[220px] sm:min-h-[280px] overflow-hidden">
          {isLoading && !questionUrl ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-400">
                Contacting Marc Conrad&apos;s Banana Web Service...
              </span>
            </div>
          ) : questionUrl ? (
            <div className="relative group max-w-full">
              <img
                src={questionUrl}
                alt="Banana Puzzle Equation"
                className="max-h-[280px] sm:max-h-[340px] w-auto object-contain rounded-xl shadow-lg border border-slate-700/40"
              />
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-[10px] text-slate-400 border border-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Zero Client Solution Leak</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400 mb-3">No active puzzle loaded.</p>
              <button
                onClick={loadNextRound}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm"
              >
                Start Puzzle
              </button>
            </div>
          )}
        </div>

        {/* Active Clues Pill Bar */}
        {Object.keys(hintsRevealed).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(hintsRevealed).map(([step, hint]) => (
              <div
                key={step}
                className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">{hint.title}:</span>
                <span>{hint.clue}</span>
              </div>
            ))}
          </div>
        )}

        {/* Keypad Input for Digits 0-9 */}
        <div className="mt-6">
          <Keypad
            onSelect={handleSubmitAnswer}
            disabled={isSubmitting || isLoading || !roundId}
            eliminatedDigits={eliminatedDigits}
          />
        </div>
      </div>

      {/* 3-Step Hint Oracle Modal */}
      <HintModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        hintsRevealed={hintsRevealed}
        onUnlockHint={handleUnlockHint}
        loading={isLoading}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={isGameOverOpen}
        stats={{
          score,
          roundsSolved,
          accuracy: totalAttempts > 0 ? Math.round((roundsSolved / totalAttempts) * 100) : 0,
          hintsUsed: hintsUsedCount
        }}
        onRestart={restartGame}
        onViewLeaderboard={() => {
          setIsGameOverOpen(false);
          onNavigateTab('leaderboard');
        }}
        onViewProfile={() => {
          setIsGameOverOpen(false);
          onNavigateTab('profile');
        }}
      />
    </div>
  );
}
