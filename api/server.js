const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const server = require('./app');

const db = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(db).then(() => console.log('DB connection successful 🔥'));

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
