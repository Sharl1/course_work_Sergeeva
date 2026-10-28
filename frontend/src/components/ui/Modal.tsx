import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Задний фон (блюр) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          {/* Сама модалка */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-apple-darkCard w-full max-w-md rounded-apple-lg shadow-2xl pointer-events-auto overflow-hidden border border-apple-border dark:border-apple-darkBorder"
            >
              <div className="flex items-center justify-between p-5 border-b border-apple-border dark:border-apple-darkBorder">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-apple-gray">
                  <X size={20} />
                </button>
              </div>
              <div className="p-5 max-h-[80vh] overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};