const ItemModel = require('./../models/itemModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.createItem = catchAsync(async (req, res, next) => {
  const data = req.body;

  if (!data.title) return next(new AppError(message), 400);
  data.user = req.user._id;

  let item = await ItemModel.create(data);
  item = await ItemModel.findById(item._id).populate({ path: 'user', select: '_id name' });

  res.status(201).json({ success: true, data: item });
});

exports.getItemById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { user: loggedInUser } = req;

  if (!id) return next(new AppError('Id must be provided!', 400));

  const item = await ItemModel.findById({ _id: id, user: loggedInUser._id }).populate({ path: 'user', select: '_id name' });
  if (!item) return next(new AppError('No item found with the given id!', 404));

  res.status(200).json({ success: true, data: item });
});

exports.searchItems = catchAsync(async (req, res, next) => {
  let { title, completed, date, page, limit } = req.query;
  const { user: loggedInUser } = req;

  page = page || 1;
  limit = limit || 10;
  skip = (page - 1) * limit;

  const filter = { user: loggedInUser._id };
  if (completed || completed == 'false') filter['completed'] = completed;
  if (title) filter['title'] = { $regex: '.*' + title + '.*', $options: 'i' };
  if (date) {
    filter['createdAt'] = {
      $gte: new Date(`${date}T00:00:00.000Z`),
      $lte: new Date(`${date}T23:59:59.000Z`),
    };
  }

  const items = await ItemModel.find(filter).populate({ path: 'user', select: '_id name' }).skip(skip).limit(limit);
  const total = await ItemModel.find(filter).countDocuments();
  res.status(200).json({
    success: true,
    data: items,
    metadata: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

exports.updateItem = catchAsync(async (req, res, next) => {
  let { id, ...update } = req.body;
  const { user: loggedInUser } = req;

  if (!id) return next(new AppError('Id must be provided!', 400));

  if (update.completed) update['completedAt'] = new Date();

  const item = await ItemModel.findOneAndUpdate({ _id: id, user: loggedInUser._id }, update, { new: true }).populate({
    path: 'user',
    select: '_id name',
  });
  if (!item) return next(new AppError('No item found with the given id!', 404));

  res.status(200).json({ success: true, data: item });
});

exports.deleteItem = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  const { user: loggedInUser } = req;

  if (!id) return next(new AppError('Id must be provided!', 400));

  const item = await ItemModel.findOneAndDelete({ _id: id, user: loggedInUser._id });
  if (!id) return next(new AppError('No item found with given id!', 404));

  res.status(200).json({ success: true, data: { id } });
});
