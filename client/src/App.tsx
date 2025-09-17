// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/header';
import { Footer } from './components/layout/Footer';
import Home from "./pages/Home";
import Menu from './pages/Menu';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import ContactUs from './pages/ContactUs';

// Admin components
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminReservations from './pages/AdminReservations';
import AdminMessages from './pages/AdminMessages';
import AdminAnalytics from './pages/AdminAnalytics';

// Import i18n configuration
import './i18n';

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-green-400 text-xl">Loading...</div>
        </div>
      }>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-grow">
                  <Home />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/menu" element={
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-grow">
                  <Menu />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/events" element={
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-grow">
                  <Events />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/gallery" element={
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-grow">
                  <Gallery />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/contact" element={
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-grow">
                  <ContactUs />
                </main>
                <Footer />
              </div>
            } />

            {/* Auth Routes */}
            <Route path="/auth" element={<AdminLogin />} />
            
            {/* Protected Admin Routes */}
            <Route path="/auth/*" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>
          </Routes>
        </Router>
      </Suspense>
    </AuthProvider>
  );
}

export default App;