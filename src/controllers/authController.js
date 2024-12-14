const { body, validationResult } = require('express-validator');
const util = require('util');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const prisma = require('../db/client');

const hashAsync = util.promisify(bcrypt.hash);
const compareAsync = util.promisify(bcrypt.compare);

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          done(null, false, { message: 'Incorrect email or password' });
          return;
        }

        const match = await compareAsync(password, user.password);

        if (!match) {
          done(null, false, { message: 'Incorrect email or password' });
          return;
        }

        done(null, user);
      } catch (e) {
        done(e);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    done(false, user);
  } catch (e) {
    done(e);
  }
});

function getSignUpPage(req, res) {
  if (req.user) {
    res.redirect('/');
    return;
  }

  res.render('signup.ejs');
}

const createAccountSchema = [
  body('first_name')
    .isAlpha()
    .withMessage('first name should contain only letters')
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('first name must be between 3 to 10 characters')
    .matches(/^\S+$/)
    .withMessage('first name should not contain spaces'),
  body('last_name')
    .isAlpha()
    .withMessage('last name should contain only letters')
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('last name must be between 3 to 10 characters')
    .matches(/^\S+$/)
    .withMessage('last name should not contain spaces'),
  body('email').isEmail().withMessage('Email must be a vaild email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must at least have 8 characters'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (req.body.password === req.body.confirm_password) {
        return true;
      }

      return false;
    })
    .withMessage('Passwords do not match'),
];

async function createAccount(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('signup', { errors: errors.array() });
    return;
  }

  const { email, first_name, last_name, password } = req.body;

  const userExists = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (userExists) {
    res.render('signup', {
      errors: [{ msg: 'user with this email already exists' }],
    });
    return;
  }

  const passwordHash = await hashAsync(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      firstName: first_name,
      lastName: last_name,
    },
  });

  res.redirect('/');
}

//login logic
function getLoginPage(req, res) {
  if (req.user) {
    res.redirect('/');
    return;
  }

  res.render('login');
}

function postLogin(req, res, next) {
  passport.authenticate('local', (err, user, options) => {
    if (err) {
      next(err);
      return;
    }

    if (!user) {
      res.render('login', { errors: [{ msg: options.message }] });
      return;
    }

    req.login(user, (err) => {
      if (err) {
        next(err);
      }

      res.redirect('/log-in');
    });
  })(req, res, next);
}

function logout(req, res, next) {
  req.logout((err) => {
    if (err) {
      next(err);
      return;
    }

    res.redirect('/');
  });
}

module.exports = {
  getSignUpPage,
  getLoginPage,
  createAccount: [createAccountSchema, createAccount],
  postLogin,
  logout,
};
