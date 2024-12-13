require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const indexRouter = require('./routes/indexRouter');
const authRouter = require('./routes/authRouter');
const prisma = require('./db/client');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);
app.use(passport.session());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/', authRouter);

const PORT = process.env.port || 3000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
