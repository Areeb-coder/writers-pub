"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  const spring = useSpring(progress, {
    stiffness: 200,
    damping: 30,
  });

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(percent);
      spring.set(percent);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, [spring]);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999] bg-transparent">
      <motion.div
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        style={{ width: spring.get() + "%" }}
      />
    </div>
  );
};

export default ReadingProgressBar;