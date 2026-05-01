const fs = require('fs');
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

  app.set('trust proxy', 1);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));

  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride('_method'));
  app.use(cookieParser());

  const mongoUrl = process.env.MONGODB_URI;
  const sessionSecret = process.env.SESSION_SECRET || 'dev-only-secret-change-me';

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

  app.use((req, res, next) => {
    res.locals.currentUserId = req.session.userId || null;
    res.locals.username = req.session.username || null;
    res.locals.flash = req.session.flash || null;
    res.locals.currentPath = req.path;
    delete req.session.flash;
    next();
  });

  app.get('/health', (req, res) => {
    res.status(200).send('ok');
  });

  app.use('/api', apiRouter);

  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  const reactIndex = path.join(clientDist, 'index.html');
  const serveReact = fs.existsSync(reactIndex);

  if (serveReact) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
      }
      res.sendFile(reactIndex, (err) => {
        if (err) next(err);
      });
    });
  } else {
    app.use(webRouter);
  }

  return app;
}

module.exports = { createApp };