import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import BookingStatusPage from './pages/BookingStatusPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/status" element={<BookingStatusPage />} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
}
