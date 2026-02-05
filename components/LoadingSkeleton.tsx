'use client';

import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'text' | 'table';
  height?: string;
  width?: string;
}

export function LoadingSkeleton({
  count = 3,
  type = 'card',
  height = 'h-12',
  width = 'w-full',
}: LoadingSkeletonProps) {
  const shimmer = {
    initial: { opacity: 0.6 },
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            variants={shimmer}
            initial="initial"
            animate="animate"
            className="glass-card h-12 rounded-lg p-4"
          />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            variants={shimmer}
            initial="initial"
            animate="animate"
            className={`glass-card ${height} rounded-lg`}
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          variants={shimmer}
          initial="initial"
          animate="animate"
          className={`glass-card ${width} ${height} rounded-lg`}
        />
      ))}
    </div>
  );
}

export function ChatMessageSkeleton() {
  const shimmer = {
    initial: { opacity: 0.6 },
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="space-y-3">
      <motion.div
        variants={shimmer}
        initial="initial"
        animate="animate"
        className="glass-card h-12 rounded-lg w-3/4 ml-auto"
      />
      <motion.div
        variants={shimmer}
        initial="initial"
        animate="animate"
        className="glass-card h-16 rounded-lg w-2/3"
      />
      <motion.div
        variants={shimmer}
        initial="initial"
        animate="animate"
        className="glass-card h-12 rounded-lg w-1/2"
      />
    </div>
  );
}

export function TableRowSkeleton() {
  const shimmer = {
    initial: { opacity: 0.6 },
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.tr
      variants={shimmer}
      initial="initial"
      animate="animate"
      className="border-b border-white/5"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-6 py-3">
          <div className="h-4 bg-white/10 rounded w-16" />
        </td>
      ))}
    </motion.tr>
  );
}
