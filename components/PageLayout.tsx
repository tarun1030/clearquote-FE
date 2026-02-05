'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export function PageLayout({
  children,
  title,
  subtitle,
  className = '',
}: PageLayoutProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`h-full flex flex-col ${className}`}
    >
      {title && (
        <motion.div
          variants={itemVariants}
          className="mb-8 px-8 pt-6"
        >
          <h1 className="text-3xl font-semibold mb-2">{title}</h1>
          {subtitle && (
            <p className="text-white/50 text-sm">{subtitle}</p>
          )}
        </motion.div>
      )}

      <motion.div
        variants={itemVariants}
        className="flex-1 overflow-hidden"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

interface SectionProps {
  children: ReactNode;
  title?: string;
  className?: string;
  delay?: number;
}

export function PageSection({
  children,
  title,
  className = '',
  delay = 0,
}: SectionProps) {
  return (
    <motion.section
      variants={itemVariants}
      transition={{ delay }}
      className={`glass-card border border-white/10 rounded-lg p-6 ${className}`}
    >
      {title && (
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {title}
          <motion.div
            className="w-1 h-1 rounded-full bg-white/20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </h2>
      )}
      {children}
    </motion.section>
  );
}

interface ListItemProps {
  children: ReactNode;
  delay?: number;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export function AnimatedListItem({
  children,
  delay = 0,
  onClick,
  active = false,
  className = '',
}: ListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`
        px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer
        ${active
          ? 'bg-white/10 border border-white/20'
          : 'hover:bg-white/5 border border-transparent'
        }
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

interface FloatingLabelProps {
  children: ReactNode;
  label: string;
}

export function FloatingLabel({ children, label }: FloatingLabelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="relative group"
    >
      {children}
      <motion.label
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute -top-6 left-4 text-xs font-semibold text-white/60 bg-background px-1 group-focus-within:text-white transition-colors"
      >
        {label}
      </motion.label>
    </motion.div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  animated?: boolean;
  className?: string;
}

export function AnimatedProgressBar({
  value,
  max = 100,
  animated = true,
  className = '',
}: ProgressBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className={`h-1 bg-white/10 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
        animate={animated ? { x: ['-100%', '0%'] } : {}}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{
          width: `${percentage}%`,
        }}
      />
    </div>
  );
}

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 2,
  className = '',
}: CounterProps) {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    let current = from;
    const increment = (to - from) / (duration * 60);
    const interval = setInterval(() => {
      current += increment;
      if (current >= to) {
        setCount(to);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [from, to, duration]);

  return <span className={className}>{count.toLocaleString()}</span>;
}

import React from 'react';
