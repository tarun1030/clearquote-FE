'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Table2, Settings, Sparkles, Wifi, WifiOff, Database, Key, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatPage from './pages/chat';
import TablesPage from './pages/tables';
import SettingsPage from './pages/settings';

type ActiveTab = 'chat' | 'tables' | 'settings';

interface ConfigStatus {
  gemini_api_key_set: boolean;
  db_url_set: boolean;
  gemini_model: string;
  validation: {
    is_valid: boolean;
    missing: string[];
  };
}

const tabs = [
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'tables', icon: Table2, label: 'Tables' },
  { id: 'settings', icon: Settings, label: 'Settings' },
] as const;

const POLL_INTERVAL = 5000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConfigStatus = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/config/status', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setConfigStatus(data);
      setLastUpdate(new Date());
      setIsLoading(false);
      setError(null);
      setRetryCount(0);
      
      if (isManualRefresh) {
        setIsRefreshing(false);
      }
    } catch (err) {
      console.error('Failed to fetch config status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      if (isManualRefresh) {
        setIsRefreshing(false);
      }
      
      // Retry logic with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchConfigStatus();
        }, delay);
      } else {
        setIsLoading(false);
        setConfigStatus(null);
      }
    }
  }, [retryCount]);

  const handleManualRefresh = useCallback(() => {
    setRetryCount(0);
    fetchConfigStatus(true);
  }, [fetchConfigStatus]);

  useEffect(() => {
    // Initial fetch
    fetchConfigStatus();
    
    // Start polling
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        fetchConfigStatus();
      }, POLL_INTERVAL);
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Stop polling when tab is hidden
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Resume polling and fetch immediately when tab becomes visible
        fetchConfigStatus();
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchConfigStatus]);

  const renderPage = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatPage />;
      case 'tables':
        return <TablesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ChatPage />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const getStatusColor = () => {
    if (error) return 'text-red-400';
    if (!configStatus) return 'text-white/30';
    if (configStatus.validation.is_valid) return 'text-green-400';
    if (configStatus.gemini_api_key_set || configStatus.db_url_set) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = () => {
    if (isLoading || isRefreshing) return Wifi;
    if (error || !configStatus) return WifiOff;
    if (configStatus.validation.is_valid) return Wifi;
    return AlertCircle;
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return '';
    const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const StatusIcon = getStatusIcon();

  return (
    <motion.div
      className="flex flex-col h-screen bg-background text-foreground overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Ambient background effect */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"
        />
      </div>

      {/* Top Navigation Bar */}
      <motion.div
        variants={itemVariants}
        className="glass-card border-b border-white/10 sticky top-0 z-50"
      >
        <div className="relative flex items-center justify-between px-8 py-4">
          {/* Left side - ChatBot Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3.5"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center"
            >
              <Sparkles size={18} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-sm font-semibold text-white">ChatBot</h1>
              <p className="text-xs text-white/40">AI Assistant</p>
            </div>
          </motion.div>

          {/* Center - Navigation Tabs */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.1 }}
                  className={`relative flex px-4 py-2 rounded-lg transition-all duration-200 group items-center gap-1.5 ${
                    isActive
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <motion.div
                    animate={isActive ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <Icon size={20} />
                  </motion.div>
                  <span className="text-sm font-medium hidden sm:inline">
                    {tab.label}
                  </span>

                  {/* Animated underline for active tab */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white/0 via-white to-white/0"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Glow effect on hover */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-white/5 mx-0"
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right side - Connection Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
            onMouseEnter={() => setShowStatusTooltip(true)}
            onMouseLeave={() => setShowStatusTooltip(false)}
          >
            <motion.div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer ${getStatusColor()}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Status Icons */}
              <div className="flex items-center gap-1.5">
                {/* API Key Status */}
                <motion.div
                  animate={
                    configStatus?.gemini_api_key_set
                      ? { scale: [1, 1.2, 1] }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Key
                    size={16}
                    className={
                      configStatus?.gemini_api_key_set
                        ? 'text-green-400'
                        : 'text-white/30'
                    }
                  />
                </motion.div>

                {/* Database Status */}
                <motion.div
                  animate={
                    configStatus?.db_url_set
                      ? { scale: [1, 1.2, 1] }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <Database
                    size={16}
                    className={
                      configStatus?.db_url_set
                        ? 'text-green-400'
                        : 'text-white/30'
                    }
                  />
                </motion.div>

                {/* Overall Connection Status */}
                <motion.div
                  animate={
                    isLoading || isRefreshing
                      ? { rotate: 360 }
                      : configStatus?.validation.is_valid
                      ? { scale: [1, 1.2, 1] }
                      : {}
                  }
                  transition={
                    isLoading || isRefreshing
                      ? { duration: 2, repeat: Infinity, ease: 'linear' }
                      : { duration: 2, repeat: Infinity, delay: 1 }
                  }
                >
                  <StatusIcon size={16} />
                </motion.div>
              </div>

              {/* Status Pulse Effect */}
              {configStatus?.validation.is_valid && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-green-400/20"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {showStatusTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-4 shadow-xl z-50"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">
                        System Status
                      </span>
                      {error ? (
                        <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                          Error
                        </span>
                      ) : configStatus?.validation.is_valid ? (
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                          Connected
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                          Issues Detected
                        </span>
                      )}
                    </div>

                    {/* Last Update Time */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50">Last updated:</span>
                      <span className="text-white/70">
                        {lastUpdate ? getTimeSinceUpdate() : 'Never'}
                      </span>
                    </div>

                    {/* Refresh Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManualRefresh();
                      }}
                      disabled={isRefreshing}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 disabled:bg-white/5 border border-white/20 rounded-lg transition-colors"
                    >
                      <motion.div
                        animate={isRefreshing ? { rotate: 360 } : {}}
                        transition={
                          isRefreshing
                            ? { duration: 1, repeat: Infinity, ease: 'linear' }
                            : {}
                        }
                      >
                        <RefreshCw size={14} className="text-white/70" />
                      </motion.div>
                      <span className="text-xs text-white/70">
                        {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                      </span>
                    </button>

                    {/* Error Display */}
                    {error && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-red-400 font-medium mb-1">
                          Connection Error:
                        </p>
                        <p className="text-xs text-white/50">
                          {error}
                        </p>
                        {retryCount > 0 && retryCount < MAX_RETRIES && (
                          <p className="text-xs text-white/40 mt-1">
                            Retrying... ({retryCount}/{MAX_RETRIES})
                          </p>
                        )}
                      </div>
                    )}

                    {/* Configuration Details */}
                    {!error && (
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <Key
                            size={14}
                            className={
                              configStatus?.gemini_api_key_set
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          />
                          <span className="text-xs text-white/70">
                            Gemini API Key
                          </span>
                          <span className="ml-auto text-xs text-white/50">
                            {configStatus?.gemini_api_key_set ? '✓' : '✗'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Database
                            size={14}
                            className={
                              configStatus?.db_url_set
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          />
                          <span className="text-xs text-white/70">
                            Database URL
                          </span>
                          <span className="ml-auto text-xs text-white/50">
                            {configStatus?.db_url_set ? '✓' : '✗'}
                          </span>
                        </div>

                        {configStatus?.gemini_model && (
                          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                            <Sparkles size={14} className="text-purple-400" />
                            <span className="text-xs text-white/70">Model</span>
                            <span className="ml-auto text-xs text-white/50 font-mono">
                              {configStatus.gemini_model}
                            </span>
                          </div>
                        )}

                        {configStatus && configStatus.validation.missing.length > 0 && (
                          <div className="pt-2 border-t border-white/10">
                            <p className="text-xs text-red-400 font-medium mb-1">
                              Missing Configuration:
                            </p>
                            {configStatus.validation.missing.map((item) => (
                              <p key={item} className="text-xs text-white/50 ml-2">
                                • {item}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tooltip Arrow */}
                  <div className="absolute -top-1 right-4 w-2 h-2 bg-black/90 border-l border-t border-white/20 transform rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* Page Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{
          duration: 0.3,
          ease: [0.23, 1, 0.320, 1],
        }}
        className="flex-1 overflow-hidden"
      >
        {renderPage()}
      </motion.div>
    </motion.div>
  );
}