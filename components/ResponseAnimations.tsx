'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface SuccessMessageProps {
  children: ReactNode;
  icon?: ReactNode;
  delay?: number;
}

export function SuccessMessage({
  children,
  icon,
  delay = 0,
}: SuccessMessageProps) {
  const messageVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300"
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <span className="text-sm font-medium">{children}</span>
    </motion.div>
  );
}

interface ErrorMessageProps {
  children: ReactNode;
  icon?: ReactNode;
  delay?: number;
}

export function ErrorMessage({
  children,
  icon,
  delay = 0,
}: ErrorMessageProps) {
  const messageVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  const shakVariants: Variants = {
    shake: {
      x: [-8, 8, -8, 8, -4, 4, 0],
      transition: {
        duration: 0.4,
        type: 'spring',
      },
    },
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover="shake"
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300"
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <span className="text-sm font-medium">{children}</span>
    </motion.div>
  );
}

interface WarningMessageProps {
  children: ReactNode;
  icon?: ReactNode;
  delay?: number;
}

export function WarningMessage({
  children,
  icon,
  delay = 0,
}: WarningMessageProps) {
  const messageVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay,
      },
    },
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-300"
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <span className="text-sm font-medium">{children}</span>
    </motion.div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className={`${sizeClasses[size]} border-2 border-white/20 border-t-white rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {message && (
        <motion.p
          className="text-sm text-white/50"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

interface TypingIndicatorProps {
  duration?: number;
}

export function TypingIndicator({ duration = 0.8 }: TypingIndicatorProps) {
  return (
    <motion.div
      className="flex items-center gap-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-white/50"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </motion.div>
  );
}

interface NotificationProps {
  children: ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function Notification({
  children,
  type = 'info',
  duration = 3000,
  onClose,
}: NotificationProps) {
  const notificationVariants: Variants = {
    hidden: {
      opacity: 0,
      x: 100,
      y: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      x: 100,
      y: -20,
      transition: { duration: 0.2 },
    },
  };

  const bgColors = {
    success: 'bg-green-500/20 border-green-500/30 text-green-300',
    error: 'bg-red-500/20 border-red-500/30 text-red-300',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  };

  return (
    <motion.div
      variants={notificationVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`px-4 py-3 rounded-lg border backdrop-blur-sm ${bgColors[type]}`}
      onAnimationComplete={() => {
        if (duration) {
          setTimeout(onClose, duration);
        }
      }}
    >
      {children}
    </motion.div>
  );
}
