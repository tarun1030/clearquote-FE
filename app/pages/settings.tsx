'use client';

import { useState } from 'react';
import { Eye, EyeOff, Check, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsField {
  label: string;
  value: string;
  isVisible: boolean;
  isMasked: boolean;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState<SettingsField>({
    label: 'API Key',
    value: '',
    isVisible: false,
    isMasked: true,
  });

  const [dbConnection, setDbConnection] = useState<SettingsField>({
    label: 'PostgreSQL Connection String',
    value: '',
    isVisible: false,
    isMasked: true,
  });

  const [saveStatus, setSaveStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
    field?: string;
  }>({ type: 'idle' });

  const [testStatus, setTestStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
    field?: string;
  }>({ type: 'idle' });

  const toggleVisibility = (field: 'api' | 'db') => {
    if (field === 'api') {
      setApiKey({ ...apiKey, isVisible: !apiKey.isVisible });
    } else {
      setDbConnection({ ...dbConnection, isVisible: !dbConnection.isVisible });
    }
  };

  const handleSave = async (field: 'api' | 'db') => {
    setSaveStatus({ type: 'loading', field });

    try {
      const fieldValue = field === 'api' ? apiKey.value : dbConnection.value;

      if (!fieldValue.trim()) {
        setSaveStatus({
          type: 'error',
          message: 'Please enter a value first',
          field,
        });
        setTimeout(() => setSaveStatus({ type: 'idle' }), 3000);
        return;
      }

      const endpoint = field === 'api' 
        ? `${API_BASE_URL}/api/config/api-key`
        : `${API_BASE_URL}/api/config/db-url`;

      const body = field === 'api'
        ? { api_key: apiKey.value }
        : { db_url: dbConnection.value };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSaveStatus({
          type: 'success',
          message: data.message,
          field,
        });
      } else {
        setSaveStatus({
          type: 'error',
          message: data.message || 'Failed to save configuration',
          field,
        });
      }
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: `Network error: Unable to connect to the server`,
        field,
      });
    }

    setTimeout(() => {
      setSaveStatus({ type: 'idle' });
    }, 3000);
  };

  const handleTest = async (field: 'api' | 'db') => {
    const fieldValue = field === 'api' ? apiKey.value : dbConnection.value;

    if (!fieldValue.trim()) {
      setTestStatus({
        type: 'error',
        message: 'Please enter a value first',
        field,
      });
      setTimeout(() => setTestStatus({ type: 'idle' }), 2000);
      return;
    }

    setTestStatus({ type: 'loading', field });

    try {
      if (field === 'api') {
        // Validate API key using the validation endpoint
        const response = await fetch(`${API_BASE_URL}/api/config/validate-api-key`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ api_key: apiKey.value }),
        });

        const data = await response.json();

        if (response.ok && data.is_valid) {
          setTestStatus({
            type: 'success',
            message: `${data.message} (${data.available_models} models available)`,
            field,
          });
        } else {
          setTestStatus({
            type: 'error',
            message: data.message || 'API Key validation failed',
            field,
          });
        }
      } else {
        // Validate database connection using the validation endpoint
        const response = await fetch(`${API_BASE_URL}/api/config/validate-db-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ db_url: dbConnection.value }),
        });

        const data = await response.json();

        if (response.ok && data.is_connected) {
          setTestStatus({
            type: 'success',
            message: `${data.message} (Database: ${data.database_name})`,
            field,
          });
        } else {
          setTestStatus({
            type: 'error',
            message: data.message || 'Database connection failed',
            field,
          });
        }
      }
    } catch (error) {
      setTestStatus({
        type: 'error',
        message: 'Connection test failed. Please check your network.',
        field,
      });
    }

    setTimeout(() => {
      setTestStatus({ type: 'idle' });
    }, 3000);
  };

  const maskValue = (value: string) => {
    if (value.length === 0) return '';
    if (value.length <= 4) return '•'.repeat(value.length);
    return value.slice(0, 4) + '•'.repeat(value.length - 4);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col overflow-y-auto"
    >
      <div className="max-w-2xl mx-auto w-full p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Settings</h1>
          <p className="text-white/50">
            Manage your secure credentials and connection settings
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* API Key Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 border border-white/10"
          >
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                {apiKey.label}
              </label>
              <p className="text-xs text-white/40 mb-4">
                Enter your Gemini API key for authentication and service integration
              </p>

              <div className="relative">
                <input
                  type={apiKey.isVisible ? 'text' : 'password'}
                  value={apiKey.isVisible ? apiKey.value : maskValue(apiKey.value)}
                  onChange={(e) => setApiKey({ ...apiKey, value: e.target.value })}
                  placeholder="Enter your API key..."
                  className="glass-input w-full pr-12 placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
                />
                <button
                  onClick={() => toggleVisibility('api')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {apiKey.isVisible ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => handleSave('api')}
                disabled={saveStatus.type === 'loading'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button px-4 py-2 text-white/70 hover:text-white disabled:opacity-50 transition-all"
              >
                {saveStatus.type === 'loading' && saveStatus.field === 'api' ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  'Save'
                )}
              </motion.button>

              <motion.button
                onClick={() => handleTest('api')}
                disabled={testStatus.type === 'loading'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button px-4 py-2 text-white/70 hover:text-white disabled:opacity-50 transition-all"
              >
                {testStatus.type === 'loading' && testStatus.field === 'api' ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  'Test Connection'
                )}
              </motion.button>
            </div>

            {/* Status Messages */}
            <div className="mt-4 space-y-2">
              <AnimatePresence mode="wait">
                {saveStatus.type !== 'idle' && saveStatus.field === 'api' && (
                  <motion.div
                    key="save-api"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      saveStatus.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                        : saveStatus.type === 'loading'
                        ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                        : 'bg-red-500/20 border border-red-500/30 text-red-300'
                    }`}
                  >
                    {saveStatus.type === 'success' ? (
                      <Check size={16} />
                    ) : saveStatus.type === 'loading' ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <X size={16} />
                    )}
                    {saveStatus.message || 'Saving...'}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {testStatus.type !== 'idle' && testStatus.field === 'api' && (
                  <motion.div
                    key="test-api"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      testStatus.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                        : testStatus.type === 'loading'
                        ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                        : 'bg-red-500/20 border border-red-500/30 text-red-300'
                    }`}
                  >
                    {testStatus.type === 'success' ? (
                      <Check size={16} />
                    ) : testStatus.type === 'loading' ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <X size={16} />
                    )}
                    {testStatus.message || 'Validating...'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* PostgreSQL Connection String Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 border border-white/10"
          >
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                {dbConnection.label}
              </label>
              <p className="text-xs text-white/40 mb-4">
                PostgreSQL connection string for database operations. Format:{' '}
                <code className="text-xs font-mono bg-black/20 px-2 py-1 rounded">
                  postgresql://user:password@host:port/database
                </code>
              </p>

              <div className="relative">
                <input
                  type={dbConnection.isVisible ? 'text' : 'password'}
                  value={
                    dbConnection.isVisible
                      ? dbConnection.value
                      : maskValue(dbConnection.value)
                  }
                  onChange={(e) =>
                    setDbConnection({ ...dbConnection, value: e.target.value })
                  }
                  placeholder="postgresql://user:password@host:port/database"
                  className="glass-input w-full pr-12 placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 font-mono text-xs"
                />
                <button
                  onClick={() => toggleVisibility('db')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {dbConnection.isVisible ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => handleSave('db')}
                disabled={saveStatus.type === 'loading'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button px-4 py-2 text-white/70 hover:text-white disabled:opacity-50 transition-all"
              >
                {saveStatus.type === 'loading' && saveStatus.field === 'db' ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  'Save'
                )}
              </motion.button>

              <motion.button
                onClick={() => handleTest('db')}
                disabled={testStatus.type === 'loading'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button px-4 py-2 text-white/70 hover:text-white disabled:opacity-50 transition-all"
              >
                {testStatus.type === 'loading' && testStatus.field === 'db' ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  'Test Connection'
                )}
              </motion.button>
            </div>

            {/* Status Messages */}
            <div className="mt-4 space-y-2">
              <AnimatePresence mode="wait">
                {saveStatus.type !== 'idle' && saveStatus.field === 'db' && (
                  <motion.div
                    key="save-db"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      saveStatus.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                        : saveStatus.type === 'loading'
                        ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                        : 'bg-red-500/20 border border-red-500/30 text-red-300'
                    }`}
                  >
                    {saveStatus.type === 'success' ? (
                      <Check size={16} />
                    ) : saveStatus.type === 'loading' ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <X size={16} />
                    )}
                    {saveStatus.message || 'Saving...'}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {testStatus.type !== 'idle' && testStatus.field === 'db' && (
                  <motion.div
                    key="test-db"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      testStatus.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                        : testStatus.type === 'loading'
                        ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                        : 'bg-red-500/20 border border-red-500/30 text-red-300'
                    }`}
                  >
                    {testStatus.type === 'success' ? (
                      <Check size={16} />
                    ) : testStatus.type === 'loading' ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <X size={16} />
                    )}
                    {testStatus.message || 'Validating...'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4 border border-yellow-500/30 bg-yellow-500/10"
          >
            <p className="text-xs text-yellow-200">
              ⚠️ <span className="font-semibold">Security Notice:</span> Your
              credentials are encrypted and never stored in plain text. Always
              keep your API keys and connection strings confidential.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}