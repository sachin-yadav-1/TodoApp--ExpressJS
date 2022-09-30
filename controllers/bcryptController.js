const bcrypt = require('bcrypt');

exports.encryptPassword = async (pass) => await bcrypt.hash(pass, 12);
exports.comparePassword = async (userPass, dbPass) => await bcrypt.compare(userPass, dbPass);
