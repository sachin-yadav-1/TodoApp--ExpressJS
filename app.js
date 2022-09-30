const express = require('express');
const dotenv = require('dotenv');

const app = express();
dotenv.config();
app.use(express.json({ limit: '10kb' }));

module.exports = app;
