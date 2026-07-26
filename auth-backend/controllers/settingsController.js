const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        isVerified: true,
        createdAt: true,
        passwordHash: true,
        googleId: true,
        githubId: true,
        mfaEnabled: true,
        emailNotifications: true,
        accentColor: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Map to safe format
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      hasPassword: !!user.passwordHash,
      hasGoogle: !!user.googleId,
      hasGithub: !!user.githubId,
      mfaEnabled: user.mfaEnabled,
      emailNotifications: user.emailNotifications,
      accentColor: user.accentColor,
    };

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, email } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;

    // Handle email change logic
    if (email && email !== user.email) {
      // Check if new email is taken
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      updates.email = email;
      updates.isVerified = false;
      
      // Generate new verification token
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      
      updates.verificationToken = verificationToken;
      updates.verificationCodeExpiry = verificationCodeExpiry;

      // Send verification email to the new address
      const { sendVerificationEmail } = require('../utils/email');
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email to new address:', emailError);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        isVerified: true,
        createdAt: true,
      }
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.disconnectProvider = async (req, res) => {
  try {
    const { provider } = req.params;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Lockout Protection Rule
    let remainingMethods = 0;
    if (user.passwordHash) remainingMethods++;
    if (user.googleId) remainingMethods++;
    if (user.githubId) remainingMethods++;

    if (remainingMethods <= 1) {
      return res.status(400).json({ 
        error: 'Cannot disconnect this account. You must set a password or link another social account first to avoid being locked out.' 
      });
    }

    const updates = {};
    if (provider === 'google') updates.googleId = null;
    else if (provider === 'github') updates.githubId = null;
    else return res.status(400).json({ error: 'Unknown provider' });

    await prisma.user.update({
      where: { id: user.id },
      data: updates
    });

    res.json({ message: `${provider} disconnected successfully` });
  } catch (error) {
    console.error('Disconnect provider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Google OAuth users might not have a password
    if (!user.passwordHash) {
      return res.status(400).json({ error: 'Account uses Google Sign-In. Cannot change password.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    if (user.emailNotifications) {
      const { sendSecurityAlertEmail } = require('../utils/email');
      try {
        await sendSecurityAlertEmail(user.email, 'Your account password was recently changed.');
      } catch (emailError) {
        console.error('Failed to send security alert email for password change:', emailError);
      }
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user.userId },
      orderBy: { lastActive: 'desc' }
    });

    // Map sessions to hide token string and mark current session
    const mappedSessions = sessions.map(s => ({
      id: s.id,
      device: s.device,
      ipAddress: s.ipAddress,
      lastActive: s.lastActive,
      createdAt: s.createdAt,
      isCurrent: s.id === req.sessionId
    }));

    res.json(mappedSessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.revokeSession = async (req, res) => {
  try {
    const sessionId = req.params.id;

    // Verify the session belongs to the user
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: Cannot revoke other user\'s session' });
    }

    await prisma.session.delete({
      where: { id: sessionId }
    });

    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

exports.setupMFA = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const secret = speakeasy.generateSecret({
      name: `Platform (${user.email})`
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaSecret: secret.base32 }
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ qrCodeUrl, secret: secret.base32 });
  } catch (error) {
    console.error('Setup MFA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyAndEnableMFA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || !user.mfaSecret) return res.status(400).json({ error: 'MFA setup not initiated' });

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 1 // allows 30 seconds drift before/after
    });

    if (verified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { mfaEnabled: true }
      });
      res.json({ message: 'MFA enabled successfully' });
    } else {
      res.status(400).json({ error: 'Invalid MFA code' });
    }
  } catch (error) {
    console.error('Verify MFA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.disableMFA = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { mfaEnabled: false, mfaSecret: null }
    });
    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('Disable MFA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { emailNotifications, accentColor } = req.body;

    const updates = {};
    if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;
    if (accentColor !== undefined) updates.accentColor = accentColor;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No preferences provided to update' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updates
    });

    if (emailNotifications === true) {
      const { sendSecurityAlertEmail } = require('../utils/email');
      try {
        await sendSecurityAlertEmail(user.email, {
          loginTime: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
          location: 'Your Request',
          ipAddress: 'N/A',
          alertMessage: 'You have successfully opted-in to receive account security email notifications.'
        });
      } catch (emailError) {
        console.error('Failed to send opt-in confirmation email:', emailError);
      }
    }

    res.json({ 
      message: 'Preferences updated successfully', 
      emailNotifications: user.emailNotifications,
      accentColor: user.accentColor
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.revokeOtherSessions = async (req, res) => {
  try {
    const currentSessionId = req.sessionId;

    await prisma.session.deleteMany({
      where: {
        userId: req.user.userId,
        id: { not: currentSessionId }
      }
    });

    res.json({ message: 'All other sessions revoked successfully' });
  } catch (error) {
    console.error('Revoke other sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account is already verified' });
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken,
        verificationCodeExpiry
      }
    });

    const { sendVerificationEmail } = require('../utils/email');
    await sendVerificationEmail(user.email, verificationToken);

    res.json({ message: 'Verification email resent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
