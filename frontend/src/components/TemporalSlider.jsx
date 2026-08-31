import React, { useState } from 'react';
import { Calendar, Play, Pause, RotateCcw } from 'lucide-react';

const TIMELINE_STOPS = [
  { date: '2026-01-10', label: 'Jan 10 (Initial Intercepts)' },
  { date: '2026-01-28', label: 'Jan 28 (Hawala Setup)' },
  { date: '2026-02-14', label: 'Feb 14 (Comms Burst Surge)' },
  { date: '2026-02-22', label: 'Feb 22 (Layered Hawala Transfer)' },
  { date: '2026-03-02', label: 'Mar 02 (Shared Burner SIM Racket)' },
  { date: '2026-03-12', label: 'Mar 12 (Full Syndicate Active)' }
];

export default function TemporalSlider({ onDateRangeChange }) {
  const [currentIndex, setCurrentIndex] = useState(TIMELINE_STOPS.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleIndexChange = (idx) => {
    setCurrentIndex(idx);
    const selectedStop = TIMELINE_STOPS[idx];
    if (onDateRangeChange) {
      onDateRangeChange(null, selectedStop.date);
    }
  };

  const handlePlayToggle = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      let step = 0;
      const interval = setInterval(() => {
        if (step < TIMELINE_STOPS.length) {
          handleIndexChange(step);
          step++;
        } else {
          clearInterval(interval);
          setIsPlaying(false);
        }
      }, 1200);
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

      {/* Stepper Slider */}
      <div className="flex-1 max-w-xl mx-8 flex items-center space-x-3">
        <input
          type="range"
          min="0"
          max={TIMELINE_STOPS.length - 1}
          value={currentIndex}
          onChange={(e) => handleIndexChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-intel-800 rounded-lg appearance-none cursor-pointer accent-intel-accent"
        />
        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
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
