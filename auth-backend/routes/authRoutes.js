const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const analyticsController = require('../controllers/analyticsController');
const rateLimit = require('../middleware/rateLimit');

const authRateLimit = rateLimit({ windowMs: 60_000, max: 10 });

function oauthFailureRedirect(req, res) {
  const err = req.query.error;
  if (err === 'access_denied') {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_denied`);
  }
  return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
}

router.get('/check-username', async (req, res) => {
  const { username } = req.query;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }
  const clean = username.trim().toLowerCase();
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (clean.length < 3 || clean.length > 20 || !usernameRegex.test(clean)) {
    return res.json({ available: false, reason: 'invalid' });
  }
  const prisma = require('../db');
  const existing = await prisma.user.findUnique({ where: { username: clean } });
  res.json({ available: !existing });
});

router.get('/social/status', (req, res) => {
  const google = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    && process.env.GOOGLE_CLIENT_ID !== 'dummy_id');
  const github = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    && process.env.GITHUB_CLIENT_ID !== 'dummy_id');
  res.json({ google, github });
});

router.post('/signup', authRateLimit, authController.signup);
router.post('/verify', authController.verifyEmail);
router.post('/resend-verification-public', authRateLimit, authController.resendVerificationPublic);
router.post('/login', authRateLimit, authController.login);
router.post('/forgot-password', authRateLimit, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Public User Profile Route
router.get('/user/:username', authController.getPublicProfile);

// Public Analytics Tracking
router.post('/analytics/track-view', analyticsController.trackView);
router.post('/analytics/track-click', analyticsController.trackClick);

const authMiddleware = require('../middleware/authMiddleware');
const settingsController = require('../controllers/settingsController');

// Settings Routes
router.get('/me', authMiddleware, settingsController.getProfile);
router.put('/profile', authMiddleware, settingsController.updateProfile);
router.patch('/preferences', authMiddleware, settingsController.updatePreferences);
router.post('/change-password', authMiddleware, settingsController.changePassword);
router.get('/sessions', authMiddleware, settingsController.getSessions);
router.get('/analytics', authMiddleware, settingsController.getAnalytics); // Security Logs
router.get('/analytics/profile', authMiddleware, analyticsController.getProfileStats); // Profile Stats
router.delete('/sessions/others', authMiddleware, settingsController.revokeOtherSessions);
router.delete('/sessions/:id', authMiddleware, settingsController.revokeSession);
router.delete('/providers/:provider', authMiddleware, settingsController.disconnectProvider);
router.delete('/me', authMiddleware, settingsController.deleteAccount);
router.post('/resend-verification', authMiddleware, settingsController.resendVerification);

// MFA Routes
router.post('/mfa/setup', authMiddleware, settingsController.setupMFA);
router.post('/mfa/verify', authMiddleware, settingsController.verifyAndEnableMFA);
router.post('/mfa/disable', authMiddleware, settingsController.disableMFA);
router.post('/verify-mfa-login', authController.verifyMfaLogin);

// OAuth Routes
router.get('/google', (req, res, next) => {
  const state = req.query.token ? req.query.token : undefined;
  passport.authenticate('google', { scope: ['profile', 'email'], state })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    if (req.query.error) return oauthFailureRedirect(req, res);
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err || !user) {
        const code = err?.message?.includes('link') ? 'oauth_link_failed' : 'oauth_failed';
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=${code}`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req, res) => {
    // If they were linking, state will contain their token, redirect to settings
    if (req.query.state) {
      return res.redirect(process.env.FRONTEND_URL + '/dashboard/settings?linked=google');
    }
    
    // MFA Intercept
    if (req.user.mfaEnabled) {
      const tempToken = jwt.sign(
        { tempUserId: req.user.id, email: req.user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '5m' }
      );
      return res.redirect(`${process.env.FRONTEND_URL}/login/mfa?token=${tempToken}`);
    }

    // Generate JWT for the frontend to store since they logged in via OAuth
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );
    
    const prisma = require('../db');
    
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
    
    try {
      await prisma.session.create({
        data: {
          userId: req.user.id,
          token: token,
          device: userAgent,
          ipAddress: ipAddress,
        }
      });
    } catch (err) {
      console.error('Failed to create session on OAuth:', err);
    }

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

router.get('/github', (req, res, next) => {
  const state = req.query.token ? req.query.token : undefined;
  passport.authenticate('github', { scope: ['user:email'], state })(req, res, next);
});

router.get('/github/callback',
  (req, res, next) => {
    if (req.query.error) return oauthFailureRedirect(req, res);
    passport.authenticate('github', { session: false }, (err, user) => {
      if (err || !user) {
        const code = err?.message?.includes('link') ? 'oauth_link_failed' : 'oauth_failed';
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=${code}`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req, res) => {
    if (req.query.state) {
      return res.redirect(process.env.FRONTEND_URL + '/dashboard/settings?linked=github');
    }

    // MFA Intercept
    if (req.user.mfaEnabled) {
      const tempToken = jwt.sign(
        { tempUserId: req.user.id, email: req.user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '5m' }
      );
      return res.redirect(`${process.env.FRONTEND_URL}/login/mfa?token=${tempToken}`);
    }
    
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );
    
    const prisma = require('../db');

    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
    
    try {
      await prisma.session.create({
        data: { userId: req.user.id, token, device: userAgent, ipAddress }
      });
    } catch (err) {
      console.error('Failed to create session on GitHub OAuth:', err);
    }

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

module.exports = router;
