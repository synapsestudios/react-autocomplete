var pkg  = require('./package.json');

exports.libname = pkg.name;
exports.path    = __dirname;
exports.version = pkg.version;

module.exports = { require('./dist/autocomplete') };
