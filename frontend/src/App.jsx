import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import MyAccount from './pages/MyAccount';
import SeekerDashboard from './pages/SeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminCreateEmployer from './pages/AdminCreateEmployer'; // ✅ Import This
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* ✅ NEW ADMIN ROUTE */}
          {/* Note: In a real app, you'd protect this route too. For now, it's public so you can access it. */}
          <Route path="/admin/create-employer" element={<AdminCreateEmployer />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
               <SeekerDashboard /> 
            </ProtectedRoute>
          } />
          
          <Route path="/employer-dashboard" element={
            <ProtectedRoute>
               <EmployerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/my-account" element={
            <ProtectedRoute>
                <MyAccount />
            </ProtectedRoute>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;