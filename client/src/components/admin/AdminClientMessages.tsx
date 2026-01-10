'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthenticatedApi } from '../../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender_type: 'client' | 'admin';
  sender_name: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  subject: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  unread_count: number;
  last_message: Message | null;
  user_email?: string;
  user_name?: string;
}

const AdminClientMessages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const conversationPollingRef = useRef<NodeJS.Timeout | null>(null);
  const { apiCall } = useAuthenticatedApi();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await apiCall('/admin/client-conversations/');
      setConversations(Array.isArray(data.conversations) ? data.conversations : []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      if (!silent) setConversations([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [apiCall]);

  const fetchMessages = useCallback(async (conversationId: string, silent = false) => {
    try {
      if (!silent) setMessagesLoading(true);
      const data = await apiCall(`/admin/client-conversations/${conversationId}/messages/`);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      if (!silent) setMessages([]);
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  }, [apiCall]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Polling for conversations list
  useEffect(() => {
    conversationPollingRef.current = setInterval(() => {
      fetchConversations(true);
    }, 5000);

    return () => {
      if (conversationPollingRef.current) {
        clearInterval(conversationPollingRef.current);
      }
    };
  }, [fetchConversations]);

  // Fetch messages when conversation selected + polling
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);

      // Start polling for new messages
      pollingRef.current = setInterval(() => {
        fetchMessages(selectedConversation.id, true);
      }, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [selectedConversation?.id, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendReply = async () => {
    if (!selectedConversation || !replyContent.trim()) return;

    const messageToSend = replyContent.trim();
    setReplyContent('');
    setSending(true);

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageToSend,
      sender_type: 'admin',
      sender_name: 'Admin',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await apiCall(`/admin/client-conversations/${selectedConversation.id}/messages/`, {
        method: 'POST',
        body: JSON.stringify({ content: messageToSend }),
      });
      fetchMessages(selectedConversation.id, true);
      fetchConversations(true);
    } catch (error) {
      console.error('Failed to send reply:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setReplyContent(messageToSend);
    } finally {
      setSending(false);
    }
  };

  const closeConversation = async (conversationId: string) => {
    try {
      await apiCall(`/admin/client-conversations/${conversationId}/close/`, {
        method: 'PATCH',
      });
      fetchConversations(true);
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, status: 'closed' } : null);
      }
    } catch (error) {
      console.error('Failed to close conversation:', error);
    }
  };

  const reopenConversation = async (conversationId: string) => {
    try {
      await apiCall(`/admin/client-conversations/${conversationId}/reopen/`, {
        method: 'PATCH',
      });
      fetchConversations(true);
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, status: 'open' } : null);
      }
    } catch (error) {
      console.error('Failed to reopen conversation:', error);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

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

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'open') return conv.status === 'open';
    if (filter === 'closed') return conv.status === 'closed';
    return true;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time chat with registered clients
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {conversations.length} Chats
          </span>
          {totalUnread > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
              {totalUnread} Unread
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {(['all', 'open', 'closed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({
              f === 'all' ? conversations.length :
              f === 'open' ? conversations.filter(c => c.status === 'open').length :
              conversations.filter(c => c.status === 'closed').length
            })
          </button>
        ))}
      </div>

      {/* Main Chat Container - WhatsApp Style */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-[650px] flex">
        {/* Conversations List - Left Panel */}
        <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 flex-col border-r border-gray-200`}>
          {/* Search Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3">
            <h3 className="font-semibold text-white text-lg">Conversations</h3>
            <p className="text-green-100 text-xs mt-0.5">{filteredConversations.length} active chats</p>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">No conversations</h3>
                <p className="mt-1 text-xs text-gray-500">Conversations will appear when clients message you.</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {(conversation.user_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      {conversation.status === 'open' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-sm font-medium text-gray-900 truncate ${conversation.unread_count > 0 ? 'font-bold' : ''}`}>
                          {conversation.user_name || 'Client'}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatMessageTime(conversation.updated_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">{conversation.user_email}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600 truncate">
                          {conversation.last_message ? (
                            <>
                              {conversation.last_message.sender_type === 'admin' && (
                                <span className="text-green-600">You: </span>
                              )}
                              {conversation.last_message.content.substring(0, 30)}
                              {conversation.last_message.content.length > 30 && '...'}
                            </>
                          ) : (
                            <span className="text-gray-400 italic">No messages yet</span>
                          )}
                        </p>
                        {conversation.unread_count > 0 && (
                          <span className="ml-2 bg-green-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area - Right Panel */}
        <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} flex-1 flex-col`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center gap-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold">
                    {(selectedConversation.user_name || 'C').charAt(0).toUpperCase()}
                  </div>
                  {selectedConversation.status === 'open' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-300 rounded-full border-2 border-green-600"></div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{selectedConversation.user_name || 'Client'}</h3>
                  <p className="text-xs text-green-100">{selectedConversation.user_email}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {selectedConversation.status === 'open' ? (
                    <button
                      onClick={() => closeConversation(selectedConversation.id)}
                      className="px-3 py-1.5 text-xs font-medium text-green-700 bg-white hover:bg-green-50 rounded-lg transition-colors"
                    >
                      Close Chat
                    </button>
                  ) : (
                    <button
                      onClick={() => reopenConversation(selectedConversation.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-400 rounded-lg transition-colors"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Area - WhatsApp style background */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-2"
                style={{
                  backgroundColor: '#e5ddd5',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ccc4\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                }}
              >
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="bg-white/80 backdrop-blur-sm rounded-full p-4">
                      <div className="w-8 h-8 border-3 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="bg-white rounded-2xl p-6 shadow-lg text-center max-w-sm">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">No messages yet</h3>
                      <p className="text-sm text-gray-500">
                        This conversation is empty. Messages from {selectedConversation.user_name || 'the client'} will appear here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Chat started indicator */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-amber-100/80 text-amber-800 text-xs px-3 py-1 rounded-full">
                        Chat with {selectedConversation.user_name || 'Client'}
                      </div>
                    </div>

                    {messages.map((message, index) => {
                      const isAdmin = message.sender_type === 'admin';
                      const showDate = index === 0 ||
                        new Date(messages[index - 1].created_at).toDateString() !==
                        new Date(message.created_at).toDateString();

                      return (
                        <div key={message.id}>
                          {/* Date separator */}
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <div className="bg-white/80 text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm">
                                {new Date(message.created_at).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          )}

                          {/* Message bubble */}
                          <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`relative max-w-[75%] px-3 py-2 shadow-sm ${
                                isAdmin
                                  ? 'bg-[#dcf8c6] rounded-lg rounded-tr-none'
                                  : 'bg-white rounded-lg rounded-tl-none'
                              }`}
                            >
                              {/* Message tail */}
                              <div
                                className={`absolute top-0 w-3 h-3 ${
                                  isAdmin
                                    ? '-right-1.5 bg-[#dcf8c6]'
                                    : '-left-1.5 bg-white'
                                }`}
                                style={{
                                  clipPath: isAdmin
                                    ? 'polygon(0 0, 100% 0, 0 100%)'
                                    : 'polygon(100% 0, 0 0, 100% 100%)'
                                }}
                              />

                              {/* Sender name for client messages */}
                              {!isAdmin && (
                                <p className="text-xs font-medium text-green-600 mb-1">
                                  {message.sender_name}
                                </p>
                              )}

                              {/* Message content */}
                              <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                                {message.content}
                              </p>

                              {/* Time and read status */}
                              <div className={`flex items-center justify-end gap-1 mt-1 ${isAdmin ? 'text-gray-500' : 'text-gray-400'}`}>
                                <span className="text-[10px]">
                                  {new Date(message.created_at).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {isAdmin && (
                                  <span className={`text-xs ${message.is_read ? 'text-blue-500' : 'text-gray-400'}`}>
                                    {message.is_read ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input - WhatsApp style */}
              {selectedConversation.status === 'open' ? (
                <div className="bg-[#f0f0f0] px-3 py-2 flex items-end gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendReply();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2.5 bg-white rounded-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none shadow-sm"
                    />
                  </div>
                  <button
                    onClick={sendReply}
                    disabled={!replyContent.trim() || sending}
                    className="w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-gray-100 px-4 py-3 text-center">
                  <p className="text-sm text-gray-500">
                    This conversation is closed.{' '}
                    <button
                      onClick={() => reopenConversation(selectedConversation.id)}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Reopen to reply
                    </button>
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Messages</h3>
                <p className="text-sm text-gray-500">
                  Select a conversation from the list to view messages and reply to clients.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminClientMessages;
