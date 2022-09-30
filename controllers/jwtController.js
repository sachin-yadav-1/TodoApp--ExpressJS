const { promisify } = require('util');
const jwt = require('jsonwebtoken');

exports.generateToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
exports.verifyToken = async (token) => await promisify(jwt.verify)(token, process.env.JWT_SECRET);
