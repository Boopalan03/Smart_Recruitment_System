const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path'); // ✅ Import 'path' module

// Import Routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ✅ Added adminRoutes
const seedSuperAdmin = require('./config/seedAdmin'); // ✅ Added seedAdmin

dotenv.config();
connectDB();
seedSuperAdmin(); // ✅ Seed default super admin if none exists

const app = express();

// Middleware
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
}));
app.use(express.json());

// ✅ CRITICAL: Make the 'uploads' folder public
// This allows the frontend to download resumes via http://localhost:5000/uploads/filename.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes); // ✅ Added adminRoutes

// Route aliases (handles cases where frontend base URL omits /api)
app.use('/auth', authRoutes);
app.use('/jobs', jobRoutes);
app.use('/admin', adminRoutes); // ✅ Added admin route alias

// Handle favicon requests cleanly
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health Check / Default Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Smart Recruitment API is running successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));