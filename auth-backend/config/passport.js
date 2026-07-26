const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Helper for linking accounts
const getLinkedUserId = (req) => {
  if (req.query.state) {
    try {
      const decoded = jwt.verify(req.query.state, process.env.JWT_SECRET || 'fallback_secret');
      return decoded.userId;
    } catch (error) {
      console.error('Invalid OAuth link token:', error);
    }
  }
  return null;
};

// =====================================
// GOOGLE STRATEGY
// =====================================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const googleId = profile.id;
      const linkedUserId = getLinkedUserId(req);

      if (linkedUserId) {
        // We are linking to an existing account
        const user = await prisma.user.update({
          where: { id: linkedUserId },
          data: { googleId }
        });
        return done(null, user);
      }

      // Normal Login / Signup
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { googleId: googleId },
            { email: email }
          ]
        }
      });

      if (user) {
        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId, isVerified: true }
          });
        }
        return done(null, user);
      } else {
        user = await prisma.user.create({
          data: {
            email,
            googleId,
            isVerified: true,
          }
        });
        return done(null, user);
      }
    } catch (error) {
      return done(error, null);
    }
  }
));

// =====================================
// GITHUB STRATEGY
// =====================================
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_secret',
    callbackURL: `${process.env.BACKEND_URL}/api/auth/github/callback`,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
      const githubId = profile.id;
      const linkedUserId = getLinkedUserId(req);

      if (linkedUserId) {
        // We are linking to an existing account
        const user = await prisma.user.update({
          where: { id: linkedUserId },
          data: { githubId }
        });
        return done(null, user);
      }

      // Normal Login / Signup
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { githubId: githubId },
            { email: email }
          ]
        }
      });

      if (user) {
        if (!user.githubId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { githubId, isVerified: true }
          });
        }
        return done(null, user);
      } else {
        user = await prisma.user.create({
          data: {
            email,
            githubId,
            isVerified: true,
          }
        });
        return done(null, user);
      }
    } catch (error) {
      return done(error, null);
    }
  }
));
