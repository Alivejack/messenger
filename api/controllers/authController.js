const { promisify } = require('util');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendtoken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOption = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  };

  res.cookie('jwt', token, cookieOption);

  res.status(statusCode).json({
    status: true,
    data: {
      name: user.name,
      email: user.email,
      photo: user.photo,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendtoken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendtoken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Check if user has the token
  let token;
  if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token) {
    return new AppError('You are not logged in! Please log in to get access.', 401);
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify(token, process.env.JWT_SECRET));

  // 3) Check if user still exists
  const currentUser = await User.findOne(decoded.id);
  if (!currentUser) {
    return new AppError(
      new AppError('The user belonging to this token does no longer exist.', 401)
    );
  }

  // 4) Check if user changed his passwored after login
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return new AppError('User recently changed password! Please log in again.', 401);
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  });

  res.status(200).json({ status: true, message: 'User logged out successfully' });
};
