const AppError = require('../utils/appError');
const UserModel = require('../models/userModel');
const jwtController = require('./jwtController');
const catchAsync = require('./../utils/catchAsync');
const bcryptController = require('./bcryptController');

const validateCreateData = (data) => {
  const missing = [];

  ['name', 'email', 'password'].forEach((prop) => !data[prop] && missing.push(prop));
  if (missing.length) return { valid: false, message: `Missing props: ${missing.join(', ')}` };

  return { valid: true, message: null };
};

const getUserByEmail = async (email) => await UserModel.findOne({ email });

exports.signup = catchAsync(async (req, res, next) => {
  const data = req.body;

  const { valid, message } = validateCreateData(data);
  if (!valid) return next(new AppError(message), 400);

  const existing = await getUserByEmail(data.email);
  if (existing) return next(new AppError('User already exists with this email!', 401));

  data.password = await bcryptController.encryptPassword(data.password);
  data.role = 'USER';

  const user = await UserModel.create(data);

  const token = jwtController.generateToken({ id: user._id, role: user.role });
  res.status(201).json({ success: true, data: user, token });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Please enter both email and password!', 400));

  const user = await getUserByEmail(email);
  if (!user || !(await bcryptController.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 404));
  }

  const token = jwtController.generateToken({ id: user._id, role: user.role });
  res.status(200).json({ success: true, data: user, token });
});

exports.protected = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;

  let token;
  if (authorization && authorization.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
  if (!token) return next(new AppError('Please login to continue!', 400));

  const decoded = await jwtController.verifyToken(token);

  const user = await UserModel.findById(decoded.id);
  if (!user) return next(new AppError('Token invalid or expired', 404));

  req.user = user;
  next();
});

exports.restrictRouteTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new AppError("You're not authorized for this route!", 400));
    next();
  };
};

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({ success: true, data: req.user });
});
