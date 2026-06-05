import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    // 1. If still loading user data, show nothing or a spinner
    if (loading) {
        return <div>Loading...</div>; 
    }

    // 2. If no user is logged in, kick them back to Login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. If logged in, allow them to see the page
    return children;
};

export default ProtectedRoute;