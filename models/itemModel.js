const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Please enter your name'] },
    description: { type: String, required: [true, 'Please enter your name'] },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const ItemModel = mongoose.model('Item', ItemSchema);
module.exports = ItemModel;
