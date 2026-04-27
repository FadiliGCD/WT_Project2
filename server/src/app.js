const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

const { webRouter } = require('./routes/web');
const { apiRouter } = require('./routes/api');

/**
// Builds and returns the configured Express app no listen
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  // Trust first proxy hop Render so cookies work behind HTTPS
  app.set('trust proxy', 1);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));

  // Parse JSON bodies for /api/* and urlencoded for HTML 
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride('_method'));

  // Cookie parser enables req.cookies and res.cookie
  app.use(cookieParser());

  const mongoUrl = process.env.MONGODB_URI;
  const sessionSecret = process.env.SESSION_SECRET || 'dev-only-secret-change-me';

  // Server-side session stored in MongoDB for multiple users and sessions
  // Connect-mongo exceeds in-memory session stores taught in basic demos
  app.use(
    session({
      name: 'sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl, ttl: 60 * 60 * 24 * 7 }),
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  // Expose current user id to all views when logged in
  app.use((req, res, next) => {
    res.locals.currentUserId = req.session.userId || null;
    res.locals.username = req.session.username || null;
    res.locals.flash = req.session.flash || null;
    delete req.session.flash;
    next();
  });

  // Simple health check for render and monitors
  app.get('/health', (req, res) => {
    res.status(200).send('ok');
  });

  // JSON api same origin as react when client/dist is served
  app.use('/api', apiRouter);

  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  const reactIndex = path.join(clientDist, 'index.html');
  const serveReact = fs.existsSync(reactIndex);

  if (serveReact) {
    // Static assets (JS/CSS) emitted by Vite under /assets/*
    app.use(express.static(clientDist));
    /**
    // Fallback react router paths 
     */
    app.get('*', (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
      }
      res.sendFile(reactIndex, (err) => {
        if (err) next(err);
      });
    });
  } else {
    // Local dev without a client build
    app.use(webRouter);
  }

  return app;
}

module.exports = { createApp };
