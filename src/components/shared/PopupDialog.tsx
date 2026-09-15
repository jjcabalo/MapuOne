'use client';

import { X } from 'lucide-react';
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopupDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  hideHeader?: boolean;
  maxWidth?: string;
  overflowVisible?: boolean;
}

export default function PopupDialog({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  hideHeader = false,
  maxWidth = 'max-w-xl',
  overflowVisible = false
}: PopupDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            className={`bg-white w-full ${maxWidth} rounded-3xl shadow-2xl flex flex-col border border-gray-100 ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}`}
          >
            {/* Header */}
            {!hideHeader && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-black">{title}</h2>
                {onClose && (
                  <button 
                    onClick={onClose}
                    className="p-1 text-gray-500 hover:text-primary hover:bg-red-50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            
            {/* Body */}
            <div className={`p-6 sm:p-10 ${overflowVisible ? 'overflow-visible' : 'max-h-[85vh] overflow-y-auto custom-scrollbar'}`}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 pb-6 sm:px-10 sm:pb-10 flex justify-center gap-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
