// client/src/App.tsx - COMPLETE FILE
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Layout components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Page components
import Home from './pages/Home';
import Menu from './pages/Menu';
import Events from './pages/Events';
import { GalleryPage } from './pages/Gallery';
import Contact from './pages/Contact';

// Auth components
import { LoginPage } from './components/auth/';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './components/admin/Dashboard';
import { ReservationsManagement } from './components/admin/ReservationsManagement';
import { EventsManagement } from './components/admin/EventsManagement';
import { GalleryManagement } from './components/admin/GalleryManagement';
import { MessagesManagement } from './components/admin/MessagesManagement';
import { AnalyticsPage } from './components/admin/AnalyticsPage';

// UI components
import { ScrollProgressBar } from './components/ui/ScrollProgressBar';
import { FloatingReservation } from './components/ui/FloatingReservation';

function App() {
  return (
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
                  <Contact />
                  <Footer />
                  <FloatingReservation position="bottom-right" style="compact" />
                </>
              } />
              
              {/* Auth Routes */}
              <Route path="/auth" element={<LoginPage />} />
              
              {/* Admin Routes */}
              <Route path="/auth/*" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="reservations" element={<ReservationsManagement />} />
                <Route path="events" element={<EventsManagement />} />
                <Route path="gallery" element={<GalleryManagement />} />
                <Route path="messages" element={<MessagesManagement />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="" element={<Navigate to="/auth/dashboard" replace />} />
              </Route>
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;