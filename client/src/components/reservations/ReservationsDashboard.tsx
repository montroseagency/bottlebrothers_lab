import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Phone, Mail, Search, Filter, Eye, CheckCircle, XCircle, AlertCircle, Plus, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Import types (remember to use 'type' keyword)
import { apiClient, type Reservation, type ReservationStats, type ReservationFilters } from '../../services/api';

const ReservationsDashboard: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<ReservationFilters>({
    status: '',
    date: '',
    search: ''
  });

  const [tempFilters, setTempFilters] = useState<ReservationFilters>({
    status: '',
    date: '',
    search: ''
  });

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Redirect to login or show error
      console.error('Authentication required for reservations dashboard');
      return;
    }
  }, [isAuthenticated, token]);

  // Fetch data
  const fetchData = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const [reservationsData, statsData] = await Promise.all([
        apiClient.getReservations(token, filters),
        apiClient.getReservationStats(token)
      ]);
      
      setReservations(reservationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch reservations data:', error);
      // You could add toast notifications here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const applyFilters = () => {
    setFilters({ ...tempFilters });
  };

  const clearFilters = () => {
    const emptyFilters = { status: '', date: '', search: '' };
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'seated': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'no_show': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} />;
      case 'pending': return <AlertCircle size={16} />;
      case 'seated': return <Users size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      case 'no_show': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    if (!token) return;

    try {
      let updatedReservation: Reservation;
      
      switch (newStatus) {
        case 'confirmed':
          updatedReservation = await apiClient.confirmReservation(token, reservationId);
          break;
        case 'cancelled':
          updatedReservation = await apiClient.cancelReservation(token, reservationId);
          break;
        case 'seated':
          updatedReservation = await apiClient.seatReservation(token, reservationId);
          break;
        case 'completed':
          updatedReservation = await apiClient.completeReservation(token, reservationId);
          break;
        case 'no_show':
          updatedReservation = await apiClient.markNoShow(token, reservationId);
          break;
        default:
          updatedReservation = await apiClient.updateReservation(token, reservationId, { status: newStatus as any });
      }
      
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId ? updatedReservation : res
        )
      );
      
      // Update selected reservation if it's the one being changed
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation(updatedReservation);
      }
      
      // Refresh stats
      const newStats = await apiClient.getReservationStats(token);
      setStats(newStats);
      
    } catch (error) {
      console.error('Failed to update reservation status:', error);
      // You could add error toast here
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the reservations dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservations Dashboard</h1>
            <p className="text-gray-600">Manage and track all restaurant reservations</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Download size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="text-blue-500" size={24} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_reservations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="text-green-500" size={24} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmed_reservations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertCircle className="text-yellow-500" size={24} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending_reservations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="text-purple-500" size={24} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.today_reservations}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reservations..."
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={tempFilters.search || ''}
                onChange={(e) => setTempFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tempFilters.status || ''}
              onChange={(e) => setTempFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="seated">Seated</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>

            <input
              type="date"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tempFilters.date || ''}
              onChange={(e) => setTempFilters(prev => ({ ...prev, date: e.target.value }))}
            />

            <div className="flex space-x-2">
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occasion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.full_name || `${reservation.first_name} ${reservation.last_name}`}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail size={12} className="mr-1" />
                          {reservation.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone size={12} className="mr-1" />
                          {reservation.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar size={14} className="mr-2" />
                        {formatDate(reservation.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock size={14} className="mr-2" />
                        {formatTime(reservation.time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users size={14} className="mr-2" />
                        {reservation.party_size}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 capitalize">
                        {reservation.occasion || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(reservation.status)}`}
                        value={reservation.status}
                        onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="seated">Seated</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedReservation(reservation)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {reservations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No reservations found matching your filters.</p>
            </div>
          )}
        </div>

        {/* Reservation Details Modal */}
        {selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Reservation Details</h3>
                  <button
                    onClick={() => setSelectedReservation(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedReservation.full_name || `${selectedReservation.first_name} ${selectedReservation.last_name}`}</p>
                      <p><strong>Email:</strong> {selectedReservation.email}</p>
                      <p><strong>Phone:</strong> {selectedReservation.phone}</p>
                      <p><strong>Party Size:</strong> {selectedReservation.party_size}</p>
                      <p><strong>Occasion:</strong> {selectedReservation.occasion || 'Not specified'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Reservation Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Date:</strong> {formatDate(selectedReservation.date)}</p>
                      <p><strong>Time:</strong> {formatTime(selectedReservation.time)}</p>
                      <p><strong>Created:</strong> {formatDate(selectedReservation.created_at)}</p>
                      <p><strong>Last Updated:</strong> {formatDate(selectedReservation.updated_at)}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-3">Status</h4>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedReservation.status)}`}>
                      {getStatusIcon(selectedReservation.status)}
                      <span className="ml-1">{selectedReservation.status}</span>
                    </div>
                  </div>

                  {selectedReservation.special_requests && (
                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-900 mb-3">Special Requests</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {selectedReservation.special_requests}
                      </p>
                    </div>
                  )}

                  {selectedReservation.dietary_restrictions && (
                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-900 mb-3">Dietary Restrictions</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {selectedReservation.dietary_restrictions}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  {selectedReservation.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(selectedReservation.id, 'confirmed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Confirm
                    </button>
                  )}
                  {selectedReservation.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(selectedReservation.id, 'seated')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Mark as Seated
                    </button>
                  )}
                  {selectedReservation.status === 'seated' && (
                    <button
                      onClick={() => handleStatusChange(selectedReservation.id, 'completed')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Complete
                    </button>
                  )}
                  {!['cancelled', 'no_show', 'completed'].includes(selectedReservation.status) && (
                    <button
                      onClick={() => handleStatusChange(selectedReservation.id, 'cancelled')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedReservation(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsDashboard;