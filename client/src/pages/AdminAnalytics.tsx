// client/src/pages/AdminAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { useAuthenticatedApi } from '../contexts/AuthContext';

interface AnalyticsData {
  monthly_revenue: number;
  total_reservations_30d: number;
  status_breakdown: Array<{
    status: string;
    count: number;
  }>;
  daily_reservations: Array<{
    date: string;
    count: number;
  }>;
  popular_times: Array<{
    time: string;
    count: number;
  }>;
  average_party_size: number;
  capacity_utilization: number;
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const { apiCall } = useAuthenticatedApi();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const data = await apiCall('/dashboard/analytics/');
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#10B981',
      seated: '#3B82F6',
      completed: '#6B7280',
      cancelled: '#EF4444',
      no_show: '#8B5CF6'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-green-100 text-sm font-medium">Estimated Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics.monthly_revenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Total Reservations</p>
              <p className="text-2xl font-bold">{analytics.total_reservations_30d}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Avg Party Size</p>
              <p className="text-2xl font-bold">{analytics.average_party_size}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-orange-100 text-sm font-medium">Capacity Utilization</p>
              <p className="text-2xl font-bold">{Math.round(analytics.capacity_utilization * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Reservations Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Reservations (Last 7 Days)</h3>
          <div className="space-y-3">
            {analytics.daily_reservations.map((day, index) => {
              const maxCount = Math.max(...analytics.daily_reservations.map(d => d.count));
              const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-green-500 h-6 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                      {day.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reservation Status Breakdown</h3>
          <div className="space-y-4">
            {analytics.status_breakdown.map((status, index) => {
              const total = analytics.status_breakdown.reduce((sum, s) => sum + s.count, 0);
              const percentage = total > 0 ? (status.count / total) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getStatusColor(status.status) }}
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {status.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{status.count}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular Times */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Reservation Times</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {analytics.popular_times.map((time, index) => {
            const maxCount = Math.max(...analytics.popular_times.map(t => t.count));
            const percentage = maxCount > 0 ? (time.count / maxCount) * 100 : 0;
            
            return (
              <div key={index} className="text-center">
                <div className="bg-gray-200 rounded-lg h-32 flex items-end justify-center p-2 mb-2">
                  <div
                    className="bg-green-500 rounded-t w-full transition-all duration-300"
                    style={{ height: `${percentage}%`, minHeight: '20px' }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatTime(time.time)}
                </div>
                <div className="text-xs text-gray-500">
                  {time.count} reservations
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {Math.round(analytics.capacity_utilization * 100)}%
            </div>
            <div className="text-sm text-gray-600">Average Capacity Usage</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.capacity_utilization > 0.8 ? 'Excellent' : 
               analytics.capacity_utilization > 0.6 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {analytics.average_party_size}
            </div>
            <div className="text-sm text-gray-600">Average Party Size</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.average_party_size > 3 ? 'Large groups preferred' : 'Small groups preferred'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {formatCurrency(analytics.monthly_revenue / analytics.total_reservations_30d || 0)}
            </div>
            <div className="text-sm text-gray-600">Revenue per Reservation</div>
            <div className="text-xs text-gray-500 mt-1">Estimated average</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;