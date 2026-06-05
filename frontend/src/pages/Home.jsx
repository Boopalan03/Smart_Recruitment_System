import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import EmployerDashboard from './EmployerDashboard';
import SeekerDashboard from './SeekerDashboard';

const Home = () => {
    const { user } = useContext(AuthContext);

    // If not logged in, show the default seeker view (or a landing page)
    if (!user) {
        return <SeekerDashboard />;
    }

    // If Employer, show Employer Dashboard
    if (user.role === 'employer') {
        return <EmployerDashboard />;
    }

    // If Seeker, show Seeker Dashboard
    return <SeekerDashboard />;
};

export default Home;