'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { Send, Loader, User, Bot, Database, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  hasTable?: boolean;
  error?: string;
  metadata?: {
    rowCount?: number;
    generatedSql?: string;
    validatedSql?: string;
  };
}

interface APIResponse {
  question: string;
  generated_sql: string;
  validated_sql: string;
  row_count: number;
  answer: string;
  error: string | null;
  stage: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I can help you query vehicle repair data. Ask me questions like "Which car models have the highest repair costs?" or "Show me recent repairs."',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSqlDetails, setShowSqlDetails] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderTextWithBold = (text: string): ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    return (
      <>
        {parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return <strong key={idx}>{boldText}</strong>;
          }
          return <span key={idx}>{part}</span>;
        })}
      </>
    );
  };

  const parseMarkdownTable = (text: string): ReactNode => {
    // Check if the text contains a markdown table
    const tableRegex = /\|(.+)\|[\r\n]+\|[\s:|-]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g;
    const match = tableRegex.exec(text);

    if (!match) {
      // No table found, return text as-is with line breaks preserved
      return text.split('\n').map((line, idx) => (
        <span key={idx}>
          {renderTextWithBold(line)}
          {idx < text.split('\n').length - 1 && <br />}
        </span>
      ));
    }

    const beforeTable = text.substring(0, match.index);
    const afterTable = text.substring(match.index + match[0].length);

    // Parse headers
    const headerRow = match[1].trim();
    const headers = headerRow
      .split('|')
      .map((h) => h.trim())
      .filter((h) => h);

    // Parse rows
    const rowsText = match[2].trim();
    const rows = rowsText
      .split('\n')
      .map((row) => {
        return row
          .split('|')
          .map((cell) => cell.trim())
          .filter((cell) => cell);
      })
      .filter((row) => row.length > 0);

    return (
      <div className="space-y-2">
        {beforeTable && (
          <p className="text-sm leading-relaxed mb-3">{renderTextWithBold(beforeTable)}</p>
        )}
        <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-white/10 border-b border-white/10">
              <tr>
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left font-medium text-white/90 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="px-4 py-3 text-white/80 whitespace-nowrap"
                    >
                      {renderTextWithBold(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {afterTable && (
          <p className="text-sm leading-relaxed mt-3">{renderTextWithBold(afterTable)}</p>
        )}
      </div>
    );
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userQuestion = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      if (data.error) {
        // Check if it's a Gemini API key error
        const isGeminiKeyError = data.error.includes('No API_KEY or ADC found') || 
                                 data.error.includes('GOOGLE_API_KEY');
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: isGeminiKeyError 
            ? "⚙️ **Configuration Required**\n\nThe Gemini API key is not configured. Please set up:\n\n1. **Gemini API Key**: Set the `GOOGLE_API_KEY` environment variable in your backend .env file\n2. **Database Configuration**: Ensure your database connection is properly configured\n\nOnce configured, restart your API server and try again."
            : `I encountered an error: ${data.error}`,
          sender: 'assistant',
          timestamp: new Date(),
          error: data.error,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: data.answer,
          sender: 'assistant',
          timestamp: new Date(),
          hasTable: data.answer.includes('|'),
          metadata: {
            rowCount: data.row_count,
            generatedSql: data.generated_sql,
            validatedSql: data.validated_sql,
          },
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error calling API:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I had trouble connecting to the database. Please make sure the API server is running on http://127.0.0.1:8000',
        sender: 'assistant',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat Window */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {messages.map((message, idx) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex gap-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'assistant' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.05 + 0.1 }}
                  className="flex-shrink-0 w-8 h-8 rounded-full glass-card border border-white/15 flex items-center justify-center"
                >
                  <Bot size={18} className="text-white/70" />
                </motion.div>
              )}
              <div className="flex flex-col gap-2 max-w-2xl">
                <div
                  className={`px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-white/10 border border-white/20 text-white rounded-2xl rounded-br-md'
                      : message.error
                      ? 'glass-card border border-red-500/30 bg-red-500/5 rounded-2xl rounded-bl-md'
                      : 'glass-card border border-white/15 rounded-2xl rounded-bl-md'
                  }`}
                >
                  {message.error && (
                    <div className="flex items-center gap-2 mb-2 text-red-400">
                      <AlertCircle size={16} />
                      <span className="text-xs font-medium">Error</span>
                    </div>
                  )}
                  <div className="text-sm leading-relaxed">
                    {message.hasTable
                      ? parseMarkdownTable(message.text)
                      : message.text.split('\n').map((line, idx) => (
                          <span key={idx}>
                            {renderTextWithBold(line)}
                            {idx < message.text.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                  </div>
                  {message.isStreaming && (
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-1 h-4 bg-white/50 ml-1 rounded-sm"
                    />
                  )}
                </div>

                {/* SQL Details Toggle */}
                {message.metadata && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() =>
                        setShowSqlDetails(
                          showSqlDetails === message.id ? null : message.id
                        )
                      }
                      className="flex items-center gap-2 text-xs text-white/50 hover:text-white/70 transition-colors group w-fit"
                    >
                      <Database size={12} />
                      <span>
                        {showSqlDetails === message.id
                          ? 'Hide SQL'
                          : `View SQL Query (${message.metadata.rowCount} rows)`}
                      </span>
                    </button>

                    <AnimatePresence>
                      {showSqlDetails === message.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="glass-card border border-white/10 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                              <Database size={12} />
                              <span className="font-medium">Generated SQL Query</span>
                            </div>
                            <pre className="text-xs text-white/80 overflow-x-auto bg-black/20 rounded p-2 font-mono">
                              {message.metadata.validatedSql ||
                                message.metadata.generatedSql}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              {message.sender === 'user' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.05 + 0.1 }}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
                >
                  <User size={18} className="text-white/70" />
                </motion.div>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 glass-card p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask about vehicle repairs..."
              className="glass-input flex-1 placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
              disabled={isLoading}
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-button px-4 py-2 text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}