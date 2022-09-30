const sendDevErr = (err, req, res) => {
  res.status(err.statusCode).json({ status: err.status, name: err.name, message: err.message, stack: err.stack });
};

const sendProdErr = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) res.status(err.statusCode).json({ status: err.status, message: err.message });
    else res.status(500).json({ status: err.status, message: 'Something went wrong!' });
  }
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const environment = process.env.NODE_ENV;

  if (environment === 'dev') sendDevErr(err, req, res);
  if (environment === 'prod') {
    let error = { ...err };
    error.message = err.message;

    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

    sendProdErr(error, req, res);
  }
};
