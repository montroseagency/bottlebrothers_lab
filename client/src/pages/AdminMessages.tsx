// client/src/pages/AdminMessages.tsx
import React, { useState, useEffect } from 'react';
import { useAuthenticatedApi } from '../contexts/AuthContext';
import type { ContactMessage } from '../services/api';

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const { apiCall } = useAuthenticatedApi();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/contact/');
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await apiCall(`/contact/${messageId}/mark_read/`, { method: 'PATCH' });
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubjectIcon = (subject: string) => {
    const icons = {
      reservation: '📅',
      private_event: '🎉',
      catering: '🍽️',
      corporate: '🏢',
      feedback: '💬',
      general: '❓'
    };
    return icons[subject as keyof typeof icons] || '📧';
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      reservation: 'bg-blue-100 text-blue-800',
      private_event: 'bg-purple-100 text-purple-800',
      catering: 'bg-green-100 text-green-800',
      corporate: 'bg-gray-100 text-gray-800',
      feedback: 'bg-yellow-100 text-yellow-800',
      general: 'bg-pink-100 text-pink-800'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'unread') return !message.is_read;
    if (filter === 'read') return message.is_read;
    return true;
  });

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer inquiries and feedback
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {messages.length} Total
          </span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} Unread
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All Messages ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread' ? 'bg-red-100 text-red-800' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'read' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Messages ({filteredMessages.length})</h3>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                <p className="mt-1 text-sm text-gray-500">No messages match the current filter.</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.is_read) {
                      markAsRead(message.id!);
                    }
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-lg">{getSubjectIcon(message.subject)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className={`text-sm font-medium text-gray-900 truncate ${!message.is_read ? 'font-bold' : ''}`}>
                          {message.name}
                        </p>
                        {!message.is_read && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      <div className="mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSubjectColor(message.subject)}`}>
                          {message.subject.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mb-1">
                        {message.message.substring(0, 60)}...
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(message.created_at!)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedMessage ? (
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getSubjectIcon(selectedMessage.subject)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedMessage.name}</h3>
                    <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSubjectColor(selectedMessage.subject)}`}>
                  {selectedMessage.subject.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{selectedMessage.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <p className="font-medium">{formatDate(selectedMessage.created_at!)}</p>
                  </div>
                  {selectedMessage.event_date && (
                    <div>
                      <span className="text-gray-500">Event Date:</span>
                      <p className="font-medium">{selectedMessage.event_date}</p>
                    </div>
                  )}
                  {selectedMessage.guest_count && (
                    <div>
                      <span className="text-gray-500">Guests:</span>
                      <p className="font-medium">{selectedMessage.guest_count}</p>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-sm text-gray-500">Message:</span>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject.replace('_', ' ')}`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Reply via Email
                </a>
                {selectedMessage.phone && (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Call Customer
                  </a>
                )}
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a message</h3>
                <p className="mt-1 text-sm text-gray-500">Choose a message from the list to view its details.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;