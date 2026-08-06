const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport'); // Load passport config
const { docClient } = require('./db');
const DynamoDBStore = require('connect-dynamodb')(session);

const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const projectRoutes = require('./routes/projectRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

const app = express();
app.set('trust proxy', true);

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://192.168.29.139:3000',
  'http://127.0.0.1:3000',
  'https://fullstack-auth-platform-topaz.vercel.app',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use(session({
  store: new DynamoDBStore({
    client: docClient,
    table: process.env.SESSIONS_TABLE || 'express-sessions',
  }),
  secret: process.env.JWT_SECRET || 'fallback_session_secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static files (like uploaded images) from /tmp for AWS Lambda
app.use('/uploads', express.static('/tmp/uploads'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
