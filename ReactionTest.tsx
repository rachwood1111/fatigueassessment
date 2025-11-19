import React, { useState, useRef, useEffect } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';

interface ReactionTestProps {
  onComplete: (averageMs: number) => void;
}

const ATTEMPTS_REQUIRED = 3;

export const ReactionTest: React.FC<ReactionTestProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<'IDLE' | 'WAITING' | 'NOW' | 'TOO_EARLY' | 'DONE'>('IDLE');
  const [results, setResults] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRound = () => {
    if (results.length >= ATTEMPTS_REQUIRED) return;
    
    setStatus('WAITING');
    // Random delay between 2s and 5s
    const delay = Math.floor(Math.random() * 3000) + 2000;
    
    timeoutRef.current = setTimeout(() => {
      setStartTime(Date.now());
      setStatus('NOW');
    }, delay);
  };

  const handleClick = () => {
    if (status === 'WAITING') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus('TOO_EARLY');
      return;
    }

    if (status === 'NOW') {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const newResults = [...results, duration];
      setResults(newResults);

      if (newResults.length >= ATTEMPTS_REQUIRED) {
        setStatus('DONE');
        const avg = newResults.reduce((a, b) => a + b, 0) / newResults.length;
        // Small delay to show "Done" before moving on
        setTimeout(() => onComplete(avg), 1500);
      } else {
        setStatus('IDLE');
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  let bgColor = "bg-slate-200";
  let message = "Tap to Start";
  
  if (status === 'WAITING') {
    bgColor = "bg-red-500";
    message = "Wait for Green...";
  } else if (status === 'NOW') {
    bgColor = "bg-green-500";
    message = "TAP NOW!";
  } else if (status === 'TOO_EARLY') {
    bgColor = "bg-amber-400";
    message = "Too Early! Tap to try again.";
  } else if (status === 'IDLE' && results.length > 0) {
    message = "Tap for next round";
  } else if (status === 'DONE') {
    bgColor = "bg-blue-500";
    message = "Test Complete";
  }

  return (
    <div className="flex flex-col items-center w-full h-full min-h-[400px]">
      <div className="mb-4 text-center">
        <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" /> Reflex Check
        </h3>
        <p className="text-slate-500">Round {Math.min(results.length + 1, ATTEMPTS_REQUIRED)} of {ATTEMPTS_REQUIRED}</p>
      </div>

      <div 
        onClick={() => {
            if (status === 'IDLE' || status === 'TOO_EARLY') startRound();
            else handleClick();
        }}
        className={`w-full flex-1 rounded-2xl shadow-inner flex items-center justify-center cursor-pointer transition-colors duration-200 select-none ${bgColor}`}
      >
        <div className="text-center">
          {status === 'TOO_EARLY' && <AlertTriangle className="w-12 h-12 text-white mx-auto mb-2" />}
          <span className="text-3xl font-bold text-white drop-shadow-md">{message}</span>
          {status === 'NOW' && <p className="text-white mt-2 text-sm">(Tap anywhere)</p>}
        </div>
      </div>
      
      <div className="mt-4 w-full">
        <div className="flex justify-between text-sm text-slate-400">
          <span>Previous: {results.length > 0 ? `${results[results.length - 1]}ms` : '-'}</span>
          <span>Avg: {results.length > 0 ? `${Math.round(results.reduce((a, b) => a + b, 0) / results.length)}ms` : '-'}</span>
        </div>
      </div>
    </div>
  );
};