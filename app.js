const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController.js');

const app = express();
dotenv.config();
app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize());
app.use(xss());
app.use(helmet());
const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again in an hour.',
});
app.use('/api', limiter);

app.use('/api/users', userRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Path not found: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
