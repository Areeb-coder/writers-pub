"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  showCursor?: boolean;
}

export default function TypewriterText({
  text,
  className = "",
  speed = 65,
  delay = 0,
  showCursor = true,
}: Props) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(delay === 0);
  const indexRef = useRef(0);

  useEffect(() => {
    if (delay === 0) return;
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    indexRef.current = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span className={`relative inline-block ${className}`}>
      <span aria-hidden="true" className="invisible select-none">
        {text}
      </span>
      <span className="absolute inset-0" aria-live="polite">
        {displayed}
        {showCursor && (
          <span
            className="inline-block w-[2px] h-[0.85em] bg-current ml-[1px] align-middle animate-pulse"
            aria-hidden="true"
          />
        )}
      </span>
    </span>
  );
}