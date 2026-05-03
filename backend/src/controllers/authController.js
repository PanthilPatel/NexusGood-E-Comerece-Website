const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const emailService = require('../services/emailService');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const cookieOptions = () => ({
  httpOnly: true,
  secure: true, // Always true for cloud deployment
  sameSite: 'none', // Required for cross-domain cookies
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, referralCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Generate unique referral code
    const baseCode = name.split(' ')[0].toUpperCase().slice(0, 4);
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const myReferralCode = `${baseCode}${randomStr}`;

    // Check for referrer
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
    }

    const userData = { 
      name, email, password, 
      segment: 'New', 
      referralCode: myReferralCode,
      referredBy: referrer ? referrer._id : null
    };
    if (phone) userData.phone = phone;

    // Save address if provided during registration
    if (address && address.street && address.city) {
      userData.addresses = [{
        label: 'Home',
        street: address.street,
        city: address.city,
        state: address.state || '',
        pincode: address.pincode || '',
        phone: phone || '',
        isPrimary: true,
      }];
    }

    const user = await User.create(userData);

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    // Create Wallet for the user
    await Wallet.create({ user: user._id });

    // Reward referrer if applicable
    if (referrer) {
      const referrerWallet = await Wallet.findOne({ user: referrer._id });
      if (referrerWallet) {
        referrerWallet.balance += 100; // Reward 100 credits
        referrerWallet.transactions.push({
          amount: 100,
          type: 'credit',
          description: `Referral reward for ${name}`,
        });
        await referrerWallet.save();

        // Send email to referrer
        emailService.sendWalletUpdate(referrer, 100, 'credit', `Referral reward for ${name}`);
      }
    }

    res.cookie('refreshToken', refreshToken, cookieOptions());

    res.status(201).json({
      message: 'Registration successful.',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        avatar: user.avatar,
        referralCode: user.referralCode,
        loyaltyTier: user.loyaltyTier,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions());

    res.json({
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        avatar: user.avatar,
        referralCode: user.referralCode,
        loyaltyTier: user.loyaltyTier,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, cookieOptions());

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired refresh token.' });
    }
    next(error);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.userId, { refreshToken: '' });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });

    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully.' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        avatar: user.avatar,
        segment: user.segment,
        loyaltyTier: user.loyaltyTier,
        referralCode: user.referralCode,
        addresses: user.addresses || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, phone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;
    if (phone !== undefined) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({
      message: 'Profile updated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const { label, street, city, state, pincode, zipCode, phone, isPrimary } = req.body;
    const user = await User.findById(req.user._id);

    if (isPrimary) {
      user.addresses.forEach(addr => addr.isPrimary = false);
    }

    user.addresses.push({
      label,
      street,
      city,
      state: state || '',
      pincode: pincode || zipCode || '',
      zipCode: zipCode || pincode || '',
      phone: phone || '',
      isPrimary: isPrimary || false,
    });
    await user.save();

    res.status(201).json({ message: 'Address added successfully.', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/auth/addresses/:addressId
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
    await user.save();

    res.json({
      message: 'Address deleted successfully.',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    // For now, we simulate success to allow the UI to work
    // In a real app, you would send a reset email here
    res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};
