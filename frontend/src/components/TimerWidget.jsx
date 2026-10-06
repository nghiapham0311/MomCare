import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Save } from 'lucide-react';

export default function TimerWidget({ title = 'Bấm giờ cữ bú / ngủ', onSave }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((sec) => sec + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(seconds);
    }
    handleReset();
  };

  return (
    <div className="bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-2xl p-4 shadow-md text-center my-4">
      <p className="text-xs uppercase tracking-wider font-semibold opacity-90">{title}</p>
      <div className="text-4xl font-extrabold my-2 tracking-widest font-mono">
        {formatTime(seconds)}
      </div>

      <div className="flex justify-center items-center gap-4 mt-3">
        <button
          onClick={() => setIsActive(!isActive)}
          className="bg-white text-pink-600 rounded-full p-3 shadow hover:bg-pink-50 transition active:scale-95"
        >
          {isActive ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
        </button>

        {seconds > 0 && (
          <>
            <button
              onClick={handleReset}
              className="bg-pink-600 text-white rounded-full p-2.5 hover:bg-pink-700 transition active:scale-95"
              title="Đặt lại"
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={handleSave}
              className="bg-emerald-500 text-white font-medium px-4 py-2 rounded-full text-xs flex items-center gap-1 shadow hover:bg-emerald-600 transition active:scale-95"
            >
              <Save size={16} /> Lưu cữ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
