var Wreck = require('wreck');

module.exports = function fetchGen(opts) {
  opts = opts || {};

  var request = Wreck.defaults(opts.wreckDefaults || {});
  var detailed = opts.detailed === true;

  return function fetch(value, cb) {
    request.get(value, { json: true }, function (err, res, body) {
      var payload;

      if (detailed) {
        payload = {};

        if (res) {
          payload.statusCode = res.statusCode;
          payload.headers = res.headers;
        }

        if (body) {
          payload.body = body;
        }
      } else {
        if (!err && res.statusCode >=200 && res.statusCode < 400) {
          payload = body;
        } else {
          err = err || new Error('invalid status code: ' + res.statusCode)
        }
      }

      cb(err, payload);
    });
  }
}
