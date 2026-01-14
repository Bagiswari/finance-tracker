const { verifyToken } = require('../utils/jwt');
const User = require('../models/userModel');

const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

module.exports = authenticate;