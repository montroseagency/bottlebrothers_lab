// client/src/App.tsx - UPDATED WITH ADMIN EVENTS ROUTING
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { Header } from './components/layout/header';
import { Footer } from './components/layout/Footer';
import { ScrollProgressBar } from './components/ui/ScrollProgressBar';

// Public Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import { ReservationPage } from './components/reservations/ReservationPage';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEvents from './pages/AdminEvents'; // NEW
import AdminReservations from './pages/AdminReservations';
import AdminMessages from './pages/AdminMessages';
import AdminAnalytics from './pages/AdminAnalytics';
import { GalleryManagement } from './components/admin/GalleryManagement';

// Layout wrapper for public pages
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <ScrollProgressBar 
      position="top" 
      color="gradient" 
      style="glow" 
      sections={['Home', 'Menu', 'Events', 'Gallery', 'Contact']} 
    />
    <Header />
    <main className="pt-16 sm:pt-20">
      {children}
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-stone-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/menu" element={<PublicLayout><Menu /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
            <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/reservations" element={<PublicLayout><ReservationPage /></PublicLayout>} />

            {/* Admin Login */}
            <Route path="/auth" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route path="/auth/dashboard" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/auth/reservations" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminReservations />
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* NEW: Admin Events Route */}
            <Route path="/auth/events" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminEvents />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/auth/gallery" element={
              <ProtectedRoute>
                <AdminLayout>
                  <GalleryManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/auth/messages" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminMessages />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/auth/analytics" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminAnalytics />
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* Fallback Routes */}
            <Route path="/admin" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;