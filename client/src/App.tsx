// client/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
// Update the import path to match the actual file name, e.g. ReservationsDashboard
// Make sure the file exists at the specified path and extension
import ReservationsDashboard from './components/reservations/ReservationsDashboard'; // Ensure ReservationsDashboard.tsx or ReservationsDashboard.js exists

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Your existing routes */}
          <Route path="/dashboard/reservations" element={<ReservationsDashboard />} />
          {/* Add other routes */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;