const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please enter your name'] },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please enter your email address'],
      validate: [validator.isEmail, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
    },
    role: {
      type: String,
      default: 'USER',
      enum: ['ADMIN', 'SUPERADMIN', 'USER'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
