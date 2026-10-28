import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Logo } from '../ui/Logo';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const text = "Digital Concierge".split("");

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-apple-bg dark:bg-apple-darkBg"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, duration: 1.5 }}
            className="mb-8"
          >
            <Logo className="w-24 h-24 drop-shadow-2xl" />
          </motion.div>

          <div className="flex space-x-1">
            {text.map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.05, ease: "easeOut" }}
                className="text-2xl font-semibold tracking-tight text-apple-text dark:text-white"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
          
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "120px", opacity: 1 }}
            transition={{ delay: 1.5, duration: 1, ease: "easeInOut" }}
            className="h-[2px] bg-postman mt-8 rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};