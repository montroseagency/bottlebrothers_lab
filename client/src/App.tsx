// client/src/App.tsx - FIXED VERSION V3
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary'

// Layout components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Page components
import Home from './pages/Home';
import Menu from './pages/Menu';
import Events from './pages/Events';
import { GalleryPage } from './pages/Gallery';
import ContactReservations from './components/admin/ContactReservations';

// Auth components - Fixed imports
import AdminLogin from './components/auth/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminReservations from './components/admin/AdminReservations';
import { EventsManagement } from './components/admin/EventsManagement';
import { GalleryManagement } from './components/admin/GalleryManagement';
import AdminMessages from './components/admin/AdminMessages';
import AdminAnalytics from './components/admin/AdminAnalytics';

// UI components
import { ScrollProgressBar } from './components/ui/ScrollProgressBar';
import { FloatingReservation } from './components/ui/FloatingReservation';

function App() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-stone-50 flex flex-col">
              <ScrollProgressBar position="top" color="gradient" style="glow" />
              
              <Routes>
                {/* Public Routes with Header/Footer */}
                <Route path="/" element={
                  <>
                    <Header />
                    <Home />
                    <Footer />
                    <FloatingReservation position="bottom-right" style="compact" />
                  </>
                } />
                
                <Route path="/menu" element={
                  <>
                    <Header />
                    <Menu />
                    <Footer />
                    <FloatingReservation position="bottom-right" style="compact" />
                  </>
                } />
                
                <Route path="/events" element={
                  <>
                    <Header />
                    <Events />
                    <Footer />
                    <FloatingReservation position="bottom-right" style="compact" />
                  </>
                } />
                
                <Route path="/gallery" element={
                  <>
                    <Header />
                    <GalleryPage />
                    <Footer />
                    <FloatingReservation position="bottom-right" style="compact" />
                  </>
                } />
                
                <Route path="/contact" element={
                  <>
                    <Header />
                    <ContactReservations />
                    <Footer />
                    <FloatingReservation position="bottom-right" style="compact" />
                  </>
                } />
                
                {/* Auth Routes - FIXED: Separate login route */}
                <Route path="/auth" element={<AdminLogin />} />
                
                {/* Admin Routes - FIXED: Use nested routes properly */}
                <Route 
                  path="/auth/*" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <Routes>
                        <Route path="" element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={
                          <AdminLayout>
                            <AdminDashboard />
                          </AdminLayout>
                        } />
                        <Route path="reservations" element={
                          <AdminLayout>
                            <AdminReservations />
                          </AdminLayout>
                        } />
                        <Route path="events" element={
                          <AdminLayout>
                            <EventsManagement />
                          </AdminLayout>
                        } />
                        <Route path="gallery" element={
                          <AdminLayout>
                            <GalleryManagement />
                          </AdminLayout>
                        } />
                        <Route path="messages" element={
                          <AdminLayout>
                            <AdminMessages />
                          </AdminLayout>
                        } />
                        <Route path="analytics" element={
                          <AdminLayout>
                            <AdminAnalytics />
                          </AdminLayout>
                        } />
                      </Routes>
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}

export default App;