const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const {
    getAllUsers,
    verifyEmployer,
    unverifyEmployer,
    blockUser,
    unblockUser,
    deleteUser,
    getDashboardStats
} = require('../controllers/adminController');

// All routes are protected by auth and admin middleware
router.use(auth, admin);

router.get('/users', getAllUsers);
router.get('/stats', getDashboardStats);
router.put('/users/:id/verify', verifyEmployer);
router.put('/users/:id/unverify', unverifyEmployer);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
