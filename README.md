# shortstop-fetch

### Example

``` js
const Shortstop = require('shortstop');
const Fetch = require('./');

const resolver = Shortstop.create();

resolver.use('fetch', Fetch());

resolver.resolve(
  { ip: 'fetch:https://httpbin.org/ip' },
  (err, { ip: {origin} }) => console.log(`Your IP: ${origin}`)
);
```
