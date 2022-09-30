const mongoose = require('mongoose');
const app = require('./app');

process.on('unhandledException', (err) => {
  console.log('UNHANDLED EXCEPTION');
  console.log(err.name, err.message);

  process.exit(1);
});

const DB = process.env.DB_LOCAL;
mongoose
  .connect(DB)
  .then((conn) => console.log('DB Connection Successful: ', conn.connections[0]['_connectionString']))
  .catch((e) => console.log('Failed DB Connections: ', e.message));

const PORT = process.env.PORT;
const server = app.listen(PORT, () => console.log('Listening to server at port: ', PORT));

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION');
  console.log(err.name, err.message);

  server.close(() => process.exit(1));
});
