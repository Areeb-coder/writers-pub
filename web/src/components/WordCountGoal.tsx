'use client';

import { useState, useEffect } from 'react';

interface WordCountGoalProps {
  wordCount: number;
}

export default function WordCountGoal({ wordCount }: WordCountGoalProps) {
  const [goal, setGoal] = useState(1000);
  const [inputValue, setInputValue] = useState('1000');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wordCountGoal');
    if (saved) {
      setGoal(Number(saved));
      setInputValue(saved);
    }
  }, []);

  const handleSetGoal = () => {
    const num = Number(inputValue);
    if (num > 0) {
      setGoal(num);
      localStorage.setItem('wordCountGoal', String(num));
      setShowInput(false);
    }
  };

  const percentage = Math.min((wordCount / goal) * 100, 100);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isComplete = percentage >= 100;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: 52, height: 52, cursor: 'pointer' }}
        onClick={() => setShowInput(!showInput)}>
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r={radius}
            fill="none" stroke="#e5e7eb" strokeWidth="4" />
          <circle cx="26" cy="26" r={radius}
            fill="none"
            stroke={isComplete ? '#22c55e' : '#8b5cf6'}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 26 26)"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <span style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '10px', fontWeight: 600,
          color: isComplete ? '#22c55e' : '#8b5cf6'
        }}>
          {Math.round(percentage)}%
        </span>
      </div>

      <div style={{ fontSize: '12px', color: '#6b7280' }}>
        {wordCount} / {goal} words
      </div>

      {showInput && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ width: '80px', padding: '4px 8px', borderRadius: '6px',
              border: '1px solid #d1d5db', fontSize: '13px' }}
            placeholder="Goal"
          />
          <button onClick={handleSetGoal}
            style={{ padding: '4px 10px', borderRadius: '6px',
              background: '#8b5cf6', color: 'white',
              border: 'none', fontSize: '13px', cursor: 'pointer' }}>
            Set
          </button>
        </div>
      )}

      {isComplete && (
        <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600 }}>
          🎉 Goal reached!
        </span>
      )}
    </div>
  );
}