const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport'); // Load passport config
const { docClient } = require('./db');
const DynamoDBStore = require('connect-dynamodb')(session);

const authRoutes = require('./routes/authRoutes');

const app = express();
app.set('trust proxy', true);

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://192.168.29.139:3000',
  'http://127.0.0.1:3000'
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
