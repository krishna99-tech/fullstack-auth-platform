const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../db');
const { logSecurityEvent } = require('../utils/logger');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendSecurityAlertEmail, getLocationFromIP } = require('../utils/email');

exports.signup = async (req, res) => {
  try {
    const { email, password, name, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Full name must be at least 2 characters' });
    }

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username.trim())) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }

    if (username.trim().length > 20) {
      return res.status(400).json({ error: 'Username must be 20 characters or fewer' });
    }

    // Check if email is taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Check if username is taken
    const existingUsername = await prisma.user.findUnique({ where: { username: username.trim().toLowerCase() } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate 6-digit code
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        verificationToken,
        verificationCodeExpiry,
      }
    });

    await logSecurityEvent(user.id, 'Account created', req.ip || 'Unknown IP', 'Unknown Location', 'info');

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.name);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    res.status(201).json({ message: 'User created. Please check your email to verify your account.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    if (user.verificationToken !== token) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (user.verificationCodeExpiry && user.verificationCodeExpiry < new Date().toISOString()) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationCodeExpiry: null,
      }
    });

    // Send Welcome Email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resendVerificationPublic = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak if user exists
      return res.json({ message: 'If your account exists and is unverified, a new code has been sent.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account is already verified' });
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationCodeExpiry
      }
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    res.json({ message: 'If your account exists and is unverified, a new code has been sent.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email first', needsVerification: true });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.mfaEnabled) {
      // Generate a short-lived temp token (e.g. 5 minutes)
      const tempToken = jwt.sign(
        { tempUserId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '5m' }
      );
      return res.json({ mfaRequired: true, tempToken });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    // Record session in database
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = (req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'Unknown IP').toString().split(',')[0].trim();
    
    await prisma.session.create({
      data: {
        userId: user.id,
        token: token,
        device: userAgent,
        ipAddress: ipAddress,
      }
    });

    const location = await getLocationFromIP(ipAddress);
    await logSecurityEvent(user.id, 'Successful login', ipAddress, location, 'info');

    // Send login alert email in the background if user has notifications enabled
    if (user.emailNotifications) {
      const loginTime = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
      sendSecurityAlertEmail(user.email, { loginTime, location, ipAddress, via2FA: false }).catch(err => console.error(err));
    }

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetExpiry,
      }
    });

    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
    }

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const speakeasy = require('speakeasy');

exports.verifyMfaLogin = async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      return res.status(400).json({ error: 'Missing token or code' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'fallback_secret');
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired MFA session' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.tempUserId } });
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({ error: 'MFA not correctly set up for this user' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid MFA code' });
    }

    // Success! Generate real token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = (req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'Unknown IP').toString().split(',')[0].trim();

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        device: userAgent,
        ipAddress
      }
    });

    const location = await getLocationFromIP(ipAddress);
    await logSecurityEvent(user.id, 'Successful MFA login', ipAddress, location, 'info');

    // Send login alert email in the background if user has notifications enabled
    if (user.emailNotifications) {
      const loginTime = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
      sendSecurityAlertEmail(user.email, { loginTime, location, ipAddress, via2FA: true }).catch(err => console.error(err));
    }

    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Verify MFA Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.resetPasswordToken !== token || !user.resetPasswordExpiry || user.resetPasswordExpiry < new Date().toISOString()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      }
    });

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const cleanUsername = username.trim().toLowerCase();
    
    // Using Prisma to find user by username
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isProfilePublic === false) {
      return res.status(403).json({ error: 'Profile is private' });
    }

    let initial = '?';
    if (user.name && user.name.length > 0) {
      initial = user.name.charAt(0).toUpperCase();
    } else if (user.email && user.email.length > 0) {
      initial = user.email.charAt(0).toUpperCase();
    } else if (user.username && user.username.length > 0) {
      initial = user.username.charAt(0).toUpperCase();
    }

    // Return only safe public fields
    res.json({
      id: user.id,
      username: user.username,
      name: user.name || user.username,
      createdAt: user.createdAt,
      avatarInitial: initial,
      bio: user.bio,
      location: user.location,
      website: user.website,
      socialLinks: user.socialLinks,
      customLinks: user.customLinks,
      theme: user.theme
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
