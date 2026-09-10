import React, { useState } from 'react';
import { Calendar, Play, Pause, RotateCcw } from 'lucide-react';

const TIMELINE_STOPS = [
  { date: '2026-01-15', label: 'Jan 15 (Initial Dimapur Intercepts)' },
  { date: '2026-01-31', label: 'Jan 31 (Logistics & Hawala Setup)' },
  { date: '2026-02-16', label: 'Feb 16 (Comms Surge & Port Infiltration)' },
  { date: '2026-02-28', label: 'Feb 28 (Layered Hawala Structuring)' },
  { date: '2026-03-15', label: 'Mar 15 (Burner SIMs & Patna Safehouse)' },
  { date: null, label: 'All Dates (Full Reconstructed Syndicate)' }
];

export default function TemporalSlider({ onDateRangeChange }) {
  const [currentIndex, setCurrentIndex] = useState(TIMELINE_STOPS.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleIndexChange = (idx) => {
    setIsPlaying(false);
    setCurrentIndex(idx);
    const selectedStop = TIMELINE_STOPS[idx];
    if (onDateRangeChange) {
      onDateRangeChange(null, selectedStop.date);
    }
  };

  // Playback timer effect that properly stops immediately when isPlaying turns false or unmounts
  React.useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < TIMELINE_STOPS.length - 1) {
            const nextIdx = prev + 1;
            if (onDateRangeChange) {
              onDateRangeChange(null, TIMELINE_STOPS[nextIdx].date);
            }
            return nextIdx;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, onDateRangeChange]);

  const handlePlayToggle = () => {
    if (!isPlaying) {
      // If at the end, restart from step 0
      if (currentIndex >= TIMELINE_STOPS.length - 1) {
        handleIndexChange(0);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="h-14 border-t border-intel-800 bg-intel-950/95 backdrop-blur px-6 flex items-center justify-between z-10 shrink-0 select-none">
      {/* Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handlePlayToggle}
          className="p-1.5 rounded-lg bg-intel-accent hover:bg-sky-400 text-slate-950 transition-colors"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <Calendar className="w-4 h-4 text-intel-accent" />
          <span className="text-slate-400 font-mono">Temporal Filter:</span>
          <span className="text-white font-bold font-mono">{TIMELINE_STOPS[currentIndex].label}</span>
        </div>
      </div>

      {/* Stepper Slider with Step Node Circles */}
      <div className="flex-1 max-w-xl mx-8 flex items-center space-x-4">
        <div className="relative flex-1 flex items-center h-6">
          {/* Background Track Line */}
          <div className="absolute left-0 right-0 h-1.5 bg-intel-900 border border-intel-800 rounded-full" />
          
          {/* Active Filled Progress Line */}
          <div 
            className="absolute left-0 h-1.5 bg-intel-accent rounded-full transition-all duration-200"
            style={{ width: `${(currentIndex / (TIMELINE_STOPS.length - 1)) * 100}%` }}
          />

          {/* Stepped Circle Pips at Every Step */}
          {TIMELINE_STOPS.map((stop, idx) => {
            const percentage = (idx / (TIMELINE_STOPS.length - 1)) * 100;
            const isPassed = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => handleIndexChange(idx)}
                style={{ left: `${percentage}%` }}
                className={`absolute -translate-x-1/2 rounded-full transition-all duration-200 z-10 flex items-center justify-center ${
                  isCurrent
                    ? 'w-4 h-4 bg-intel-accent border-2 border-intel-950 shadow-md shadow-intel-accent/50 ring-4 ring-intel-accent/30 scale-110'
                    : isPassed
                    ? 'w-3.5 h-3.5 bg-intel-accent border-2 border-intel-950 hover:scale-125 shadow-sm shadow-intel-accent/30'
                    : 'w-3.5 h-3.5 bg-intel-900 border-2 border-intel-700 hover:border-intel-accent hover:bg-slate-800 hover:scale-125'
                }`}
                title={`${stop.label} (Step ${idx + 1})`}
              >
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                )}
              </button>
            );
          })}

          {/* Interactive Range Input Overlay for Dragging */}
          <input
            type="range"
            min="0"
            max={TIMELINE_STOPS.length - 1}
            value={currentIndex}
            onChange={(e) => handleIndexChange(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
        </div>

        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap bg-intel-900 px-2 py-0.5 rounded border border-intel-800">
          Step {currentIndex + 1}/{TIMELINE_STOPS.length}
        </span>
      </div>

      {/* Reset */}
      <button
        onClick={() => handleIndexChange(TIMELINE_STOPS.length - 1)}
        className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center space-x-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Show All</span>
      </button>
    </div>
  );
}
