const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars').default || require('nodemailer-express-handlebars');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Resolves an IP address to a human-readable location string using ip-api.com (free, no key).
 * Returns "City, Region, Country" or falls back to the raw IP if lookup fails.
 */
exports.getLocationFromIP = (ip) => {
  return new Promise((resolve) => {
    if (!ip) return resolve('Unknown Location');

    // Strip IPv4-mapped IPv6 prefix (e.g. ::ffff:192.168.1.1 → 192.168.1.1)
    const cleanIp = ip.replace(/^::ffff:/, '').trim();

    // Loopback / private addresses can't be geolocated
    const isPrivate =
      cleanIp === '127.0.0.1' ||
      cleanIp === '::1' ||
      cleanIp === 'localhost' ||
      cleanIp.startsWith('192.168.') ||
      cleanIp.startsWith('10.') ||
      cleanIp.startsWith('172.16.') ||
      cleanIp.startsWith('172.17.') ||
      cleanIp.startsWith('172.18.') ||
      cleanIp.startsWith('172.19.') ||
      cleanIp.startsWith('172.2') ||
      cleanIp.startsWith('172.30.') ||
      cleanIp.startsWith('172.31.') ||
      cleanIp.startsWith('fd') ||  // IPv6 ULA
      cleanIp.startsWith('fe80');  // IPv6 link-local

    if (isPrivate) {
      return resolve('Local / Private Network');
    }

    const url = `http://ip-api.com/json/${cleanIp}?fields=status,city,regionName,country`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'success') {
            const parts = [json.city, json.regionName, json.country].filter(Boolean);
            resolve(parts.length > 0 ? parts.join(', ') : 'Unknown Location');
          } else {
            resolve('Unknown Location');
          }
        } catch {
          resolve('Unknown Location');
        }
      });
    }).on('error', () => resolve('Unknown Location'));
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

exports.sendVerificationEmail = async (email, token, name) => {
  const digits = String(token).split('').map(d => d);
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Auth Platform" <noreply@myplatform.com>',
    to: email,
    subject: 'Verify your email address',
    template: 'verification',
    context: {
      name: name || 'there',
      email,
      digits,
      verifyCode: token,
      verifyLink: `${process.env.FRONTEND_URL}/verify-email?email=${encodeURIComponent(email)}&token=${token}`,
    }
  });
};

exports.sendWelcomeEmail = async (email, name) => {
  const loginLink = `${process.env.FRONTEND_URL}/login`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Auth Platform" <noreply@myplatform.com>',
    to: email,
    subject: 'Welcome to Auth Platform!',
    template: 'welcome',
    context: {
      name: name || 'there',
      email,
      loginLink,
    }
  });
};

exports.sendPasswordResetEmail = async (email, token, name) => {
  const digits = String(token).split('').map(d => d);
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Auth Platform" <noreply@myplatform.com>',
    to: email,
    subject: 'Reset Your Password',
    template: 'reset-password',
    context: {
      name: name || 'there',
      email,
      digits,
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

