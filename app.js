const express = require('express');
const dotenv = require('dotenv');

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

module.exports = app;
