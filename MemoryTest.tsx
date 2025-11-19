import React, { useState } from 'react';
import { Brain, Play } from 'lucide-react';

interface MemoryTestProps {
  onComplete: (level: number) => void;
}

export const MemoryTest: React.FC<MemoryTestProps> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null); // Currently flashing index in sequence
  const [userIndex, setUserIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<'START' | 'PLAYING_SEQUENCE' | 'WAITING_INPUT' | 'FAILED' | 'COMPLETE'>('START');
  const [level, setLevel] = useState(1);
  
  // Max level to keep it reasonable for a quick field test
  const MAX_LEVEL = 5;
  
  // 4 tiles for mobile friendliness
  const tiles = [0, 1, 2, 3]; 

  // Start a new level
  const startLevel = () => {
    const nextNum = Math.floor(Math.random() * 4);
    const newSequence = [...sequence, nextNum];
    setSequence(newSequence);
    setUserIndex(0);
    setGameState('PLAYING_SEQUENCE');
    setPlaybackIndex(null);
    
    // Play the sequence
    let i = 0;
    // Increased interval to 1200ms (slower) for better usability
    const interval = setInterval(() => {
      setPlaybackIndex(newSequence[i]);
      // Turn off highlight after 800ms
      setTimeout(() => setPlaybackIndex(null), 800);
      
      i++;
      if (i >= newSequence.length) {
        clearInterval(interval);
        setTimeout(() => setGameState('WAITING_INPUT'), 800);
      }
    }, 1200); 
  };

  const handleTileClick = (tileIndex: number) => {
    if (gameState !== 'WAITING_INPUT') return;

    // Visual feedback
    setPlaybackIndex(tileIndex);
    setTimeout(() => setPlaybackIndex(null), 200);

    // Logic
    if (tileIndex === sequence[userIndex]) {
      const nextUserIndex = userIndex + 1;
      setUserIndex(nextUserIndex);

      if (nextUserIndex === sequence.length) {
        if (level >= MAX_LEVEL) {
            setGameState('COMPLETE');
            setTimeout(() => onComplete(level), 1000);
        } else {
            setLevel(l => l + 1);
            setTimeout(startLevel, 1000);
        }
      }
    } else {
      setGameState('FAILED');
      setTimeout(() => onComplete(level - 1), 1500);
    }
  };

  const startGame = () => {
    setSequence([]);
    setLevel(1);
    setTimeout(startLevel, 100);
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
       <div className="mb-4 text-center">
        <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" /> Memory Check
        </h3>
        <p className="text-slate-500">Level {level}</p>
      </div>

      {/* Increased gap to allow for scaling without overlap */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-[300px] aspect-square mb-6 p-2">
        {tiles.map((i) => {
            const isActive = playbackIndex === i;
            
            return (
                <button
                    key={i}
                    disabled={gameState !== 'WAITING_INPUT'}
                    className={`
                        rounded-2xl transition-all duration-200 ease-out
                        ${isActive 
                            ? 'scale-110 z-10 shadow-2xl brightness-110' // Pop effect
                            : 'scale-90 shadow-md opacity-80 hover:opacity-100' // Resting state (smaller)
                        }
                        ${i === 0 ? 'bg-red-500' : ''}
                        ${i === 1 ? 'bg-blue-500' : ''}
                        ${i === 2 ? 'bg-yellow-500' : ''}
                        ${i === 3 ? 'bg-green-500' : ''}
                    `}
                    onClick={() => handleTileClick(i)}
                />
            );
        })}
      </div>

      <div className="text-center h-12">
          {gameState === 'START' && (
              <button 
                onClick={startGame}
                className="bg-slate-800 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-slate-700"
              >
                <Play className="w-4 h-4" /> Start Pattern
              </button>
          )}
          {gameState === 'PLAYING_SEQUENCE' && <span className="text-lg font-bold text-slate-800 animate-pulse">Watch Sequence...</span>}
          {gameState === 'WAITING_INPUT' && <span className="text-lg font-bold text-slate-800">Your turn! Repeat it.</span>}
          {gameState === 'FAILED' && <span className="text-lg font-bold text-red-600">Incorrect</span>}
          {gameState === 'COMPLETE' && <span className="text-lg font-bold text-green-600">Excellent!</span>}
      </div>
    </div>
  );
};
