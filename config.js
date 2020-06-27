const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  mongo_username: process.env.MONGO_USERNAME,
  mongo_password: process.env.MONGO_PASSWORD
};
