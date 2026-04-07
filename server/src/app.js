// Middleware, session, cookies, routes, views
const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

const { webRouter } = require('./routes/web');
const { apiRouter } = require('./routes/api');

function createApp() {
  const app = express();

  // Trust 1st proxy hop Render so secure cookies work behind HTTPS
  app.set('trust proxy', 1);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));

  // Parsing JSON bodies 
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride('_method'));

  // Cookie parser enables req.cookies and res.cookieremember last search query and last opened week in meal planner
  app.use(cookieParser());

  const mongoUrl = process.env.MONGODB_URI;
  const sessionSecret = process.env.SESSION_SECRET || 'dev-only-secret-change-me';

  // Server-side session stored in MongoDB connect-mongo for multiple users and sessions
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

  // Exposing current user id to all views when logged in
  app.use((req, res, next) => {
    res.locals.currentUserId = req.session.userId || null;
    res.locals.username = req.session.username || null;
    res.locals.flash = req.session.flash || null;
    delete req.session.flash;
    next();
  });

  app.use(webRouter);
  app.use('/api', apiRouter);

  // Simple health check for Render
  app.get('/health', (req, res) => {
    res.status(200).send('ok');
  });

  return app;
}

module.exports = { createApp };
