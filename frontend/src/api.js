import axios from 'axios';

// Create an Axios instance
const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Make sure this matches your backend port
});

// ✅ INTERCEPTOR: Automatically adds the token to headers
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers['x-auth-token'] = token;
    }
    return req;
});

export default API;