
import React, { useState, useEffect, useRef } from 'react';
import { Disc } from 'lucide-react';

interface VigilanceTestProps {
  onComplete: (accuracy: number) => void;
}

type SignalType = 'NONE' | 'GO' | 'STOP';

export const VigilanceTest: React.FC<VigilanceTestProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<'INSTRUCTION' | 'PLAYING' | 'DONE'>('INSTRUCTION');
  const [currentSignal, setCurrentSignal] = useState<SignalType>('NONE');
  const [score, setScore] = useState(100); // Start at 100%, deduct for errors
  const [eventsProcessed, setEventsProcessed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Refs to track state inside intervals without closure issues
  const signalRef = useRef<SignalType>('NONE');
  const hasActedRef = useRef(false);
  // Add a ref to track status to avoid stale closure issues in the game loop
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Timer Logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (status === 'PLAYING') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setStatus('DONE');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Game Loop Logic
  useEffect(() => {
    if (status !== 'PLAYING') return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let innerTimeoutId: ReturnType<typeof setTimeout>;

    const runCycle = () => {
      // 1. Reset to NONE (blank screen)
      setCurrentSignal('NONE');
      signalRef.current = 'NONE';
      hasActedRef.current = false;

      // Random interval between stimuli (800ms - 1500ms)
      const interval = Math.floor(Math.random() * 700) + 800;

      timeoutId = setTimeout(() => {
        if (statusRef.current !== 'PLAYING') return;

        // 2. Pick a signal
        // 70% chance of GO (Green), 30% chance of STOP (Red)
        const isGo = Math.random() > 0.3;
        const nextSignal = isGo ? 'GO' : 'STOP';
        
        setCurrentSignal(nextSignal);
        signalRef.current = nextSignal;
        
        // 3. Signal duration (how long it stays on screen)
        // 800ms to react
        innerTimeoutId = setTimeout(() => {
             // Check for "Missed Opportunity" (Didn't tap Green)
             if (signalRef.current === 'GO' && !hasActedRef.current) {
                 setScore(s => Math.max(0, s - 10)); // Penalty for missing a green
             }
             setEventsProcessed(p => p + 1);
             
             if (statusRef.current === 'PLAYING') {
                 runCycle();
             }
        }, 800);

      }, interval);
    };

    runCycle();

    return () => {
        clearTimeout(timeoutId);
        clearTimeout(innerTimeoutId);
    };
  }, [status]); 

  // Finish Handler
  useEffect(() => {
    if (status === 'DONE') {
      setTimeout(() => onComplete(score), 1500);
    }
  }, [status, score, onComplete]);

  const handleTap = () => {
    if (status !== 'PLAYING') return;
    if (hasActedRef.current) return; // Already tapped for this cycle

    hasActedRef.current = true;

    if (currentSignal === 'GO') {
        // Correct! Do nothing to score, just visual feedback?
        // Maybe small animation or sound later.
    } else if (currentSignal === 'STOP') {
        // FAILED INHIBITION! Bad error.
        setScore(s => Math.max(0, s - 20)); // Heavy penalty for tapping Red
    } else {
        // Tapped on blank?
        setScore(s => Math.max(0, s - 5)); // Minor penalty for jittery fingers
    }
    
    // Hide signal immediately on tap to give feedback
    setCurrentSignal('NONE');
    signalRef.current = 'NONE';
  };

  const startGame = () => {
    setScore(100);
    setEventsProcessed(0);
    setTimeLeft(30);
    setStatus('PLAYING');
  };

  // -- RENDERERS --

  if (status === 'INSTRUCTION') {
     return (
         <div className="flex flex-col items-center justify-center h-full p-4 text-center">
             <div className="flex gap-4 mb-6">
                 <div className="w-12 h-12 rounded-full bg-green-500 shadow-lg animate-pulse"></div>
                 <div className="w-12 h-12 rounded-full bg-red-500 shadow-lg opacity-50"></div>
             </div>
             <h3 className="text-2xl font-bold text-slate-800 mb-2">Traffic Light Test</h3>
             <p className="text-slate-600 mb-6 max-w-xs">
                 Test your focus.
                 <br/><br/>
                 <span className="text-green-600 font-bold">GREEN LIGHT</span> = TAP FAST!
                 <br/>
                 <span className="text-red-600 font-bold">RED LIGHT</span> = DO NOT TAP.
             </p>
             <button 
                onClick={startGame}
                className="w-full max-w-xs bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg"
             >
                 Start (30s)
             </button>
         </div>
     );
  }

  if (status === 'DONE') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Test Complete</h3>
            <div className={`text-5xl font-black mb-2 ${score > 80 ? 'text-green-600' : 'text-amber-600'}`}>{score}%</div>
            <p className="text-slate-500">Vigilance Score</p>
        </div>
      );
  }

  let buttonClass = "bg-slate-100 border-slate-300";
  if (currentSignal === 'GO') buttonClass = "bg-green-500 border-green-600 shadow-green-200 shadow-xl scale-105";
  if (currentSignal === 'STOP') buttonClass = "bg-red-500 border-red-600 shadow-red-200 shadow-xl";

  return (
    <div className="flex flex-col items-center w-full h-full max-w-md mx-auto">
      <div className="flex justify-between w-full mb-8 px-4 pt-4">
          <span className="font-mono text-slate-500 font-bold">Time: {timeLeft}s</span>
          <span className="font-mono text-slate-500 font-bold">Score: {score}%</span>
      </div>

      <div className="flex-1 w-full px-4 pb-8 flex items-center justify-center">
         {/* The Big Button Area */}
         <button
            onMouseDown={handleTap}
            onTouchStart={(e) => { e.preventDefault(); handleTap(); }}
            className={`
                w-64 h-64 rounded-full border-8 transition-all duration-100 flex items-center justify-center
                ${buttonClass}
            `}
         >
             {currentSignal === 'GO' && <span className="text-white font-black text-3xl tracking-widest">GO</span>}
             {currentSignal === 'STOP' && <span className="text-white font-black text-3xl tracking-widest">STOP</span>}
         </button>
      </div>
      
      <p className="text-slate-400 text-sm mb-8">Tap Green. Ignore Red.</p>
    </div>
  );
};
