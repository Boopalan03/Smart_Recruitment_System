const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get the token from the header
    const token = req.header('x-auth-token');

    // 2. Check if no token exists
    if (!token) {
        return res.status(401).json({ msg: 'Please Login to Upload the resume' });
    }

    // 3. Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // ✅ This adds the user ID to the request object
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};