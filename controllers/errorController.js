const sendDevErr = (err, req, res) => {
  res.status(err.statusCode).json({ status: err.status, name: err.name, message: err.message, stack: err.stack });
};

const sendProdErr = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) res.status(err.statusCode).json({ status: err.status, message: err.message });
    else res.status(500).json({ status: err.status, message: 'Something went wrong!' });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const environment = process.env.NODE_ENV;

  if (environment === 'development') sendDevErr(err, req, res);
  if (environment === 'production') sendProdErr(error, req, res);
};
