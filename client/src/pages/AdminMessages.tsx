// client/src/pages/AdminMessages.tsx
import React, { useState, useEffect } from 'react';
import { useAuthenticatedApi } from '../contexts/AuthContext';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  event_date?: string;
  guest_count?: number;
  event_type?: string;
  is_read: boolean;
  is_replied: boolean;
  created_at: string;
}

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const { apiCall } = useAuthenticatedApi();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await apiCall('/contact/');
      setMessages(data.results || data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await apiCall(`/contact/${messageId}/mark_read/`, {
        method: 'PATCH',
      });
      
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAsReplied = async (messageId: string) => {
    try {
      await apiCall(`/contact/${messageId}/mark_replied/`, {
        method: 'PATCH',
      });
      
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, is_replied: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as replied:', error);
    }
  };

  const getSubjectDisplay = (subject: string) => {
    const subjects = {
      reservation: 'Reservation Inquiry',
      private_event: 'Private Event',
      catering: 'Catering Services',
      corporate: 'Corporate Booking',
      feedback: 'Feedback',
      general: 'General Inquiry'
    };
    return subjects[subject as keyof typeof subjects] || subject;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredMessages = messages.filter(message => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !message.is_read) ||
      (filter === 'unreplied' && !message.is_replied) ||
      (filter === 'subject' && message.subject === searchTerm);
      
    const matchesSearch = searchTerm === '' || 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const MessageModal = ({ message, onClose }: { message: ContactMessage; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Message Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Message Header */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">From</label>
                <p className="text-sm text-gray-900">{message.name}</p>
                <p className="text-sm text-gray-500">{message.email}</p>
                {message.phone && <p className="text-sm text-gray-500">{message.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <p className="text-sm text-gray-900">{getSubjectDisplay(message.subject)}</p>
                <label className="block text-sm font-medium text-gray-700 mt-2">Date</label>
                <p className="text-sm text-gray-500">{formatDate(message.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Event Details (if applicable) */}
          {(message.event_date || message.guest_count || message.event_type) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Event Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {message.event_date && (
                  <div>
                    <label className="block font-medium text-gray-700">Event Date</label>
                    <p className="text-gray-900">{new Date(message.event_date).toLocaleDateString()}</p>
                  </div>
                )}
                {message.guest_count && (
                  <div>
                    <label className="block font-medium text-gray-700">Guest Count</label>
                    <p className="text-gray-900">{message.guest_count}</p>
                  </div>
                )}
                {message.event_type && (
                  <div>
                    <label className="block font-medium text-gray-700">Event Type</label>
                    <p className="text-gray-900">{message.event_type}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 border-t pt-4">
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${message.is_read ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">{message.is_read ? 'Read' : 'Unread'}</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${message.is_replied ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-600">{message.is_replied ? 'Replied' : 'Pending Reply'}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {!message.is_read && (
                <button
                  onClick={() => markAsRead(message.id)}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  Mark as Read
                </button>
              )}
              {!message.is_replied && (
                <button
                  onClick={() => markAsReplied(message.id)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  Mark as Replied
                </button>
              )}
              <a
                href={`mailto:${message.email}?subject=Re: ${getSubjectDisplay(message.subject)}`}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            Total: {filteredMessages.length} messages
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread Only</option>
              <option value="unreplied">Unreplied Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Name, email, or message content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter('all');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No messages match your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !message.is_read ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.is_read) {
                    markAsRead(message.id);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-sm font-medium ${!message.is_read ? 'font-bold text-gray-900' : 'text-gray-900'}`}>
                        {message.name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getSubjectDisplay(message.subject)}
                      </span>
                      {!message.is_read && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{message.email}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {message.message.substring(0, 150)}
                      {message.message.length > 150 && '...'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                    <div className="flex space-x-1">
                      {!message.is_replied && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending Reply
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <MessageModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
};

export default AdminMessages;