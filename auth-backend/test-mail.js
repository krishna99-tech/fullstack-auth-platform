// test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Connecting to AWS SMTP server...');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Make sure this is in your .env
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

  try {
    // Replace the 'to' address with your actual personal email!
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@[EMAIL_ADDRESS]',
      to: '[EMAIL_ADDRESS]', // <--- Change this!
      subject: 'AWS SES Test Email',
      text: 'Hello! If you are reading this, your AWS SES email delivery is working perfectly.',
    });

    console.log('\n✅ SUCCESS! Email was accepted by AWS SES.');
    console.log('Message ID:', info.messageId);
    console.log('AWS Response:', info.response);
    
  } catch (error) {
    console.error('\n❌ ERROR: Failed to send email.');
    console.error(error.message);
  }
}

testEmail();