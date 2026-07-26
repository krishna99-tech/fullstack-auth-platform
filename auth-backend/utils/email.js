const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars').default || require('nodemailer-express-handlebars');
const path = require('path');
const https = require('https');

/**
 * Resolves an IP address to a human-readable location string using ip-api.com (free, no key).
 * Returns "City, Region, Country" or falls back to the raw IP if lookup fails.
 */
exports.getLocationFromIP = (ip) => {
  return new Promise((resolve) => {
    // Loopback / private addresses can't be geolocated
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return resolve('Local / Private Network');
    }

    const url = `https://ip-api.com/json/${ip}?fields=status,city,regionName,country,isp`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'success') {
            const parts = [json.city, json.regionName, json.country].filter(Boolean);
            resolve(parts.join(', '));
          } else {
            resolve(ip);
          }
        } catch {
          resolve(ip);
        }
      });
    }).on('error', () => resolve(ip));
  });
};


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Configure Handlebars plugin
const handlebarOptions = {
  viewEngine: {
    extName: '.hbs',
    partialsDir: path.resolve(__dirname, '../templates'),
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname, '../templates'),
  extName: '.hbs',
};

transporter.use('compile', hbs(handlebarOptions));

exports.sendVerificationEmail = async (email, token) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"My Platform" <noreply@myplatform.com>',
    to: email,
    subject: 'Verify your email address',
    template: 'verification',
    context: {
      verifyCode: token, // Renamed to verifyCode for clarity
      verifyLink: `${process.env.FRONTEND_URL}/verify-email?email=${encodeURIComponent(email)}&token=${token}`,
    }
  });
};

exports.sendWelcomeEmail = async (email) => {
  const loginLink = `${process.env.FRONTEND_URL}/login`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"My Platform" <noreply@myplatform.com>',
    to: email,
    subject: 'Welcome to Our Platform!',
    template: 'welcome',
    context: {
      loginLink: loginLink,
    }
  });
};

exports.sendPasswordResetEmail = async (email, token) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"My Platform" <noreply@myplatform.com>',
    to: email,
    subject: 'Reset Your Password',
    template: 'reset-password',
    context: {
      resetCode: token,
      resetLink: `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(email)}&token=${token}`,
    }
  });
};

exports.sendSecurityAlertEmail = async (email, { loginTime, location, ipAddress, via2FA = false, alertMessage } = {}) => {
  const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@securealert>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"SecureAuth Alerts" <security@myplatform.com>',
    to: email,
    subject: `New sign-in to your account on ${loginTime}`,
    template: 'security-alert',
    context: {
      loginTime: loginTime || 'Unknown',
      location: location || 'Unknown',
      ipAddress: ipAddress || 'Unknown',
      via2FA,
      // legacy fallback for non-login alerts (password change, opt-in, etc.)
      alertMessage: alertMessage || null,
      actionLink: `${process.env.FRONTEND_URL}/dashboard/settings`,
    },
    headers: {
      'Message-ID': messageId,
      'X-Mailer': 'SecureAuth Notifications',
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'High',
      'Precedence': 'transactional',
      'Auto-Submitted': 'auto-generated',
    }
  });
};

