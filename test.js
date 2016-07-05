var Shortstop = require('shortstop');
var Nock = require('nock');
var Fetch = require('./');
var Tap = require('tap');

function createResolver(opts) {
  var resolver = Shortstop.create();
  resolver.use('fetch', Fetch(opts));

  return resolver;
}

function createConfig(path) {
  var domain = 'http://fake.website';
  var remote = 'fetch:' + domain + path;
  var api = Nock(domain).get(path);

  return {
    reply: api.reply.bind(api),
    replyWithError: api.replyWithError.bind(api),
    create: function (resolver, cb) {
      resolver.resolve({ remote: remote }, cb);
    }
  };
}

Tap.tearDown(Nock.restore);


Tap.test('not detailed', function (t) {
  var resolver = createResolver();

  t.afterEach(function (done) {
    Nock.cleanAll();
    done();
  });

  t.test('success', function (st) {
    var config = createConfig('/api.json');
    var body = {success: true};
    var code = 200;

    var scope = config.reply(code, body, {'content-type': 'application/json'});

    config.create(resolver, function (err, data) {
      st.error(err);

      st.equal(data.remote.success, body.success);
      st.ok(scope.isDone());
      st.end();
    });
  });

  t.test('non-200 response (return failure)', function (st) {
    var config = createConfig('/not-found');
    var body = 'Resource not found';
    var code = 404;

    var scope = config.reply(code, body);

    config.create(resolver, function (err, data) {
      st.type(err, 'Error');

      st.notOk(data);
      st.ok(scope.isDone());
      st.end();
    });
  });

  t.end();
});


Tap.test('detailed', function (t) {
  var resolver = createResolver({ detailed: true });

  t.afterEach(function (done) {
    Nock.cleanAll();
    done();
  });

  t.test('success (json)', function (st) {

    var config = createConfig('/json');
    var body = {success: true};
    var code = 200;

    var scope = config.reply(code, body, {'content-type': 'application/json'});

    config.create(resolver, function (err, data) {
      st.error(err);

      st.equal(data.remote.statusCode, code);
      st.equal(data.remote.body.success, body.success);
      st.ok(scope.isDone());
      st.end();
    });
  });

  t.test('success (buffer)', function (st) {

    var config = createConfig('/text');
    var body = 'success';
    var code = 200;

    var scope = config.reply(code, body, {'content-type': 'text/plain'});

    config.create(resolver, function (err, data) {
      st.error(err);

      st.equal(data.remote.statusCode, code);
      st.ok(Buffer.isBuffer(data.remote.body));
      st.equal(data.remote.body.toString(), body);

      st.ok(scope.isDone());
      st.end();
    });
  });

  t.test('non-200 response (return success)', function (st) {

    var config = createConfig('/404');
    var body = 'Resource not found';
    var code = 200;

    var scope = config.reply(code, body);

    config.create(resolver, function (err, data) {
      st.error(err);

      st.equal(data.remote.statusCode, code);
      st.equal(data.remote.body.toString(), body);

      st.ok(scope.isDone());
      st.end();
    });
  });

  t.test('http or config failure', function (st) {

    var config = createConfig('/failure');

    var scope = config.replyWithError('unknown error');

    config.create(resolver, function (err, data) {
      st.type(err, 'Error');

      st.notOk(data);
      st.ok(scope.isDone());
      st.end();
    });
  });

  t.end();
});
