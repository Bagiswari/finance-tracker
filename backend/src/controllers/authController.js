const User = require('../models/userModel');
const { generateToken } = require('../utils/jwt');

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Log what we received
    console.log('📝 Registration attempt:', { email, fullName });

    // Validation
    if (!email || !password || !fullName) {
      console.log('❌ Missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.'
      });
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    // Create user
    console.log('✨ Creating new user...');
    const user = await User.create(email, password, fullName);
    console.log('✅ User created:', user.id);

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email });

    // Validation
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Find user
    console.log('🔍 Finding user...');
    const user = await User.findByEmail(email);
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password
    console.log('🔑 Verifying password...');
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate token
    const token = generateToken(user.id);
    console.log('✅ Login successful');

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile.'
    });
  }
};

module.exports = { register, login, getProfile };