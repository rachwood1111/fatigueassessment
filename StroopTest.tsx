import React, { useState, useEffect } from 'react';
import { Focus, Check, X } from 'lucide-react';

interface StroopTestProps {
  onComplete: (accuracy: number) => void;
}

type ColorOption = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';
const COLORS: ColorOption[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
const COLOR_MAP: Record<ColorOption, string> = {
  RED: 'text-red-600',
  BLUE: 'text-blue-600',
  GREEN: 'text-green-600',
  YELLOW: 'text-yellow-500',
};
const BG_MAP: Record<ColorOption, string> = {
  RED: 'bg-red-100 border-red-300 active:bg-red-200',
  BLUE: 'bg-blue-100 border-blue-300 active:bg-blue-200',
  GREEN: 'bg-green-100 border-green-300 active:bg-green-200',
  YELLOW: 'bg-yellow-100 border-yellow-300 active:bg-yellow-200',
};

export const StroopTest: React.FC<StroopTestProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<'INSTRUCTION' | 'PLAYING' | 'DONE'>('INSTRUCTION');
  const [currentWord, setCurrentWord] = useState<ColorOption>('RED');
  const [currentInk, setCurrentInk] = useState<ColorOption>('BLUE');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  // Increased time from 20 to 30 seconds
  const [timeLeft, setTimeLeft] = useState(30);

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

  useEffect(() => {
    if (status === 'DONE') {
      // Calculate accuracy
      const accuracy = attempts === 0 ? 0 : Math.round((score / attempts) * 100);
      setTimeout(() => onComplete(accuracy), 1500);
    }
  }, [status, score, attempts, onComplete]);

  const nextRound = () => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    let ink = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // Ensure we don't just get easy matches all the time, but sometimes we do
    // 30% chance of match (Congruent), 70% mismatch (Incongruent)
    if (Math.random() > 0.3 && word === ink) {
       // Force mismatch if it randomly matched
       while(ink === word) {
         ink = COLORS[Math.floor(Math.random() * COLORS.length)];
       }
    }
    
    setCurrentWord(word);
    setCurrentInk(ink);
  };

  const handleChoice = (selectedColor: ColorOption) => {
    if (status !== 'PLAYING') return;
    
    setAttempts(a => a + 1);
    if (selectedColor === currentInk) {
      setScore(s => s + 1);
    }
    nextRound();
  };

  const startGame = () => {
    setScore(0);
    setAttempts(0);
    setTimeLeft(30);
    nextRound();
    setStatus('PLAYING');
  };

  if (status === 'INSTRUCTION') {
     return (
         <div className="flex flex-col items-center justify-center h-full p-4 text-center">
             <Focus className="w-16 h-16 text-indigo-500 mb-4" />
             <h3 className="text-2xl font-bold text-slate-800 mb-2">Color Match</h3>
             <p className="text-slate-600 mb-6">
                 Tap the button that matches the <strong>INK COLOR</strong> of the word, not what the word says.
             </p>
             <div className="bg-slate-100 p-4 rounded-xl mb-6 border border-slate-300">
                 <p className="text-sm text-slate-500 mb-2">Example:</p>
                 <span className="text-3xl font-black text-green-600 block mb-2">RED</span>
                 <p className="text-sm text-slate-800">Correct Answer: <strong className="text-green-600">GREEN</strong></p>
             </div>
             <button 
                onClick={startGame}
                className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg"
             >
                 Start (30s)
             </button>
         </div>
     );
  }

  if (status === 'DONE') {
      const accuracy = attempts === 0 ? 0 : Math.round((score / attempts) * 100);
      return (
        <div className="flex flex-col items-center justify-center h-full">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Test Complete</h3>
            <div className="text-4xl font-black text-indigo-600 mb-2">{accuracy}%</div>
            <p className="text-slate-500">Accuracy Score</p>
        </div>
      );
  }

  return (
    <div className="flex flex-col items-center w-full h-full max-w-md mx-auto">
      <div className="flex justify-between w-full mb-8 px-4 pt-4">
          <span className="font-mono text-slate-500">Time: {timeLeft}s</span>
          <span className="font-mono text-slate-500">Score: {score}/{attempts}</span>
      </div>

      <div className="flex-1 flex items-center justify-center mb-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 w-64 h-40 flex items-center justify-center">
             <span className={`text-5xl font-black tracking-wider ${COLOR_MAP[currentInk]}`}>
                 {currentWord}
             </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full mb-4">
        {COLORS.map((color) => (
            <button
                key={color}
                onClick={() => handleChoice(color)}
                className={`${BG_MAP[color]} py-6 rounded-xl border-b-4 font-bold text-slate-700 transition-transform active:scale-95`}
            >
                {color}
            </button>
        ))}
      </div>
    </div>
  );
};