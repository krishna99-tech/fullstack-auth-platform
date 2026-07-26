const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars').default || require('nodemailer-express-handlebars');
const path = require('path');

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
