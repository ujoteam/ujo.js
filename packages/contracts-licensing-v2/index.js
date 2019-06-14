require('babel-register');
require('babel-polyfill');
require('dotenv/config');
require('./app');

exports.LicenseCore = require('./build/contracts/LicenseCore.json');
