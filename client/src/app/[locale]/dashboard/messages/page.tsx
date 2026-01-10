'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { getStoredTokens } from '@/lib/api/clientAuth';

interface Message {
  id: string;
  content: string;
  sender_type: 'client' | 'admin';
  sender_name: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  subject: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count: number;
}

const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
  : 'http://localhost:8000/api';

export default function MessagesPage() {
  const { user } = useClientAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationSubject, setNewConversationSubject] = useState('');
  const [newConversationMessage, setNewConversationMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAuthHeaders = () => {
    const tokens = getStoredTokens();
    return {
      'Content-Type': 'application/json',
      'Authorization': tokens ? `Bearer ${tokens.access}` : '',
    };
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/client/conversations/`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch {
      // Use mock data for now
      setConversations([
        {
          id: '1',
          subject: 'Question about VIP benefits',
          status: 'open',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          unread_count: 1,
          last_message: {
            id: 'm1',
            content: 'Thank you for your inquiry! Let me explain the benefits...',
            sender_type: 'admin',
            sender_name: 'Lounge Team',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_read: false,
          },
        },
        {
          id: '2',
          subject: 'Reservation modification request',
          status: 'closed',
          created_at: new Date(Date.now() - 604800000).toISOString(),
          updated_at: new Date(Date.now() - 259200000).toISOString(),
          unread_count: 0,
          last_message: {
            id: 'm2',
            content: 'Your reservation has been updated as requested.',
            sender_type: 'admin',
            sender_name: 'Lounge Team',
            created_at: new Date(Date.now() - 259200000).toISOString(),
            is_read: true,
          },
        },
      ]);
    }
    setLoading(false);
  };

  const loadMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/client/conversations/${conversationId}/messages/`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch {
      // Use mock data
      setMessages([
        {
          id: 'm1',
          content: 'Hello! I would like to know more about the VIP benefits.',
          sender_type: 'client',
          sender_name: user?.full_name || 'You',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          is_read: true,
        },
        {
          id: 'm2',
          content: 'Thank you for your inquiry! Let me explain the benefits...\n\nAs a VIP member, you get:\n- Priority reservations\n- Exclusive discounts\n- Special event access\n\nWould you like to upgrade your membership?',
          sender_type: 'admin',
          sender_name: 'Lounge Team',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: false,
        },
      ]);
    }
    setMessagesLoading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/client/conversations/${selectedConversation.id}/messages/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: messageContent }),
      });
      const data = await response.json();
      if (data.success) {
        loadMessages(selectedConversation.id);
      } else {
        // Add message locally for demo
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: messageContent,
          sender_type: 'client',
          sender_name: user?.full_name || 'You',
          created_at: new Date().toISOString(),
          is_read: true,
        }]);
      }
    } catch {
      // Add message locally for demo
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: messageContent,
        sender_type: 'client',
        sender_name: user?.full_name || 'You',
        created_at: new Date().toISOString(),
        is_read: true,
      }]);
    }
    setSending(false);
  };

  const createConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConversationSubject.trim() || !newConversationMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/client/conversations/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subject: newConversationSubject,
          message: newConversationMessage,
        }),
      });
      const data = await response.json();
      if (data.success) {
        loadConversations();
        setShowNewConversation(false);
        setNewConversationSubject('');
        setNewConversationMessage('');
      }
    } catch {
      // Create locally for demo
      const newConv: Conversation = {
        id: Date.now().toString(),
        subject: newConversationSubject,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: 0,
        last_message: {
          id: Date.now().toString(),
          content: newConversationMessage,
          sender_type: 'client',
          sender_name: user?.full_name || 'You',
          created_at: new Date().toISOString(),
          is_read: true,
        },
      };
      setConversations(prev => [newConv, ...prev]);
      setShowNewConversation(false);
      setNewConversationSubject('');
      setNewConversationMessage('');
      setSelectedConversation(newConv);
    }
    setSending(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatMessageDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  };

  // Skeleton loader
  const SkeletonConversation = () => (
    <div className="p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] lg:h-screen flex">
      {/* Conversations List */}
      <div className={`w-full lg:w-80 xl:w-96 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <button
              onClick={() => setShowNewConversation(true)}
              className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500">Contact us anytime</p>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <>
              <SkeletonConversation />
              <SkeletonConversation />
              <SkeletonConversation />
            </>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">No messages yet</h3>
              <p className="text-sm text-gray-500 mb-4">Start a conversation with us</p>
              <button
                onClick={() => setShowNewConversation(true)}
                className="text-amber-600 hover:text-amber-700 font-medium text-sm"
              >
                Send a message
              </button>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-amber-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    conv.status === 'open'
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.subject}</h3>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatDate(conv.updated_at)}
                      </span>
                    </div>
                    {conv.last_message && (
                      <p className="text-sm text-gray-500 truncate">{conv.last_message.content}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {conv.unread_count > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-500 text-white rounded-full">
                          {conv.unread_count} new
                        </span>
                      )}
                      <span className={`text-xs ${conv.status === 'open' ? 'text-green-600' : 'text-gray-400'}`}>
                        {conv.status}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages View */}
      <div className={`flex-1 flex flex-col bg-gray-50 ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
        {selectedConversation ? (
          <>
            {/* Message Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">{selectedConversation.subject}</h2>
                <p className="text-sm text-gray-500">
                  {selectedConversation.status === 'open' ? 'Active conversation' : 'Closed'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.sender_type === 'client' ? 'order-2' : ''}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.sender_type === 'client'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className={`flex items-center gap-2 mt-1 ${
                        message.sender_type === 'client' ? 'justify-end' : ''
                      }`}>
                        <span className="text-xs text-gray-400">{message.sender_name}</span>
                        <span className="text-xs text-gray-400">{formatMessageDate(message.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {selectedConversation.status === 'open' && (
              <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200/50">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={1}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Select a conversation</h3>
              <p className="text-gray-500">Choose from the list or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">New Message</h2>
              <button
                onClick={() => setShowNewConversation(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={createConversation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={newConversationSubject}
                  onChange={(e) => setNewConversationSubject(e.target.value)}
                  placeholder="What's this about?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  value={newConversationMessage}
                  onChange={(e) => setNewConversationMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
