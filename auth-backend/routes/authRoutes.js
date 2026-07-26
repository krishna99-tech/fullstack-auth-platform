const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/verify', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

const authMiddleware = require('../middleware/authMiddleware');
const settingsController = require('../controllers/settingsController');

// Settings Routes
router.get('/me', authMiddleware, settingsController.getProfile);
router.put('/profile', authMiddleware, settingsController.updateProfile);
router.patch('/preferences', authMiddleware, settingsController.updatePreferences);
router.post('/change-password', authMiddleware, settingsController.changePassword);
router.get('/sessions', authMiddleware, settingsController.getSessions);
router.delete('/sessions', authMiddleware, settingsController.revokeOtherSessions);
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
  passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL + '/login?error=oauth_failed' }),
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
    
    // We MUST initialize Prisma with the pg adapter because the generated client requires it
    const { Pool } = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { PrismaClient } = require('@prisma/client');
    
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
    
    let tempPool;
    let tempPrisma;
    try {
      tempPool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(tempPool);
      tempPrisma = new PrismaClient({ adapter });
      
      await tempPrisma.session.create({
        data: {
          userId: req.user.id,
          token: token,
          device: userAgent,
          ipAddress: ipAddress,
        }
      });
    } catch (err) {
      console.error('Failed to create session on OAuth:', err);
    } finally {
      if (tempPrisma) await tempPrisma.$disconnect();
      if (tempPool) await tempPool.end();
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
  passport.authenticate('github', { failureRedirect: process.env.FRONTEND_URL + '/login?error=oauth_failed' }),
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
    
    const { Pool } = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { PrismaClient } = require('@prisma/client');

    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
    
    let tempPool;
    let tempPrisma;
    try {
      tempPool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(tempPool);
      tempPrisma = new PrismaClient({ adapter });
      
      await tempPrisma.session.create({
        data: { userId: req.user.id, token, device: userAgent, ipAddress }
      });
    } catch (err) {
      console.error('Failed to create session on GitHub OAuth:', err);
    } finally {
      if (tempPrisma) await tempPrisma.$disconnect();
      if (tempPool) await tempPool.end();
    }

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

module.exports = router;
