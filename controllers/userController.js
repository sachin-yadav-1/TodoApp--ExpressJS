const UserModel = require('./../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const bcryptController = require('./bcryptController');

const validateCreateData = (data) => {
  const missing = [];

  ['name', 'email', 'password'].forEach((prop) => !data[prop] && missing.push(prop));
  if (missing.length) return { valid: false, message: `Missing props: ${missing.join(', ')}` };
  return { valid: true, message: null };
};

const getUserByEmail = async (email) => await UserModel.findOne({ email });

exports.createUser = catchAsync(async (req, res, next) => {
  const data = req.body;

  const { valid, message } = validateCreateData(data);
  if (!valid) return next(new AppError(message), 400);

  const existing = await getUserByEmail(data.email);
  if (existing) return next(new AppError('User already exists with this email!', 401));

  data.password = await bcryptController.encryptPassword(data.password);
  if (!data.role) data.role = 'USER';

  const user = (await UserModel.create(data)).toObject();

  if (user) {
    delete user.__v;
    delete user.password;
  }

  res.status(201).json({ success: true, data: user });
});

exports.searchUsers = catchAsync(async (req, res, next) => {
  let { name, email, role, page, limit } = req.query;

  page = page || 1;
  limit = limit || 10;
  skip = (page - 1) * limit;

  const filter = {};
  if (role) filter['role'] = role;
  if (name) filter['name'] = { $regex: '.*' + name + '.*', $options: 'i' };
  if (email) filter['name'] = { $regex: '.*' + email + '.*', $options: 'i' };

  const users = await UserModel.find(filter).select('-__v -password').skip(skip).limit(limit);
  const total = await UserModel.find(filter).countDocuments();

  res.status(200).json({
    success: true,
    data: users,
    metadata: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  if (!id) return next(new AppError('Id must be provided!', 400));

  const user = await UserModel.findById(id).select('-__v -password');
  if (!user) return next(new AppError('No user found with the given id!', 404));

  res.status(200).json({ success: true, data: user });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  let { id, ...update } = req.body;
  if (!id) return next(new AppError('Id must be provided!', 400));

  if (update.email) {
    const exists = await getUserByEmail(update.email);
    if (exists) return next(new AppError('User already exists with this email!', 401));
  }

  const user = await UserModel.findByIdAndUpdate(id, update, { new: true }).select('-__v -password');
  if (!user) return next(new AppError('No user found with the given id!', 404));

  res.status(200).json({ success: true, data: user });
});

exports.softDeleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { user: loggedInUser } = req;
  if (!id) return next(new AppError('Id must be provided!', 400));

  if ((loggedInUser.role !== 'ADMIN' || loggedInUser.role !== 'SUPERADMIN') && String(loggedInUser._id) !== String(id)) {
    return next(new AppError('You are not authorized for this action!', 400));
  }

  const user = await UserModel.findByIdAndUpdate(id, { isActive: false });
  if (!user) return next(new AppError('No user found with the given id!', 404));

  res.status(200).json({ success: true, data: { id } });
});

exports.hardDeleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new AppError('Id must be provided!', 400));

  const user = await UserModel.findByIdAndDelete(id);
  if (!user) return next(new AppError('No user found with the given id!', 404));

  res.status(200).json({ success: true, data: { id } });
});
