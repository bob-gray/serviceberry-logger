serviceberry-logger
===================

[![CircleCI](https://circleci.com/gh/bob-gray/serviceberry-logger.svg?style=svg)](https://circleci.com/gh/bob-gray/serviceberry-logger)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b427036ce3a06d83d218/test_coverage)](https://codeclimate.com/github/bob-gray/serviceberry-logger/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/b427036ce3a06d83d218/maintainability)](https://codeclimate.com/github/bob-gray/serviceberry-logger/maintainability)
[![npm version](https://badge.fury.io/js/serviceberry-logger.svg)](https://badge.fury.io/js/serviceberry-logger)

A logger plugin for [Serviceberry](https://serviceberry.js.org).

Logs HTTP requests and responses and attaches a child logger to each request at
`request.log`. Loggers are [winston](https://www.npmjs.com/package/winston) loggers.

Install
-------

```shell-script
npm install serviceberry-logger
```

Example
-------

```js
logger = require("serviceberry-logger");

trunk.use(logger("server.log"))
	.catch(logger.error);
```

Each request is logged when received as
  - **message** `request`
  - **id** *string*
  - **ip** *string*
  - **method** *string*
  - **host** *string*
  - **url** *string*
  - **headers** *object*

Each response is logged when finished as
  - **message** `response`
  - **id** *string*
  - **elapsed** *number milliseconds*
  - **status**
    - **code** *number*
	- **text** *string*
  - **headers** *object*	 

Child loggers for each request are bound with the request id so all log output
for a given request is easy to find. Logging within other request handlers
can be done like this

```js
request.log.info("some awesome message");
```
or
```js
request.log.warn("Watch out!", {danger: true});
```

See [winston](https://www.npmjs.com/package/winston) for more details.


Reference
---------

`serviceberry-logger` can be called with one of two signatures.

### logger(path)

  - **path** *string*

    The path to the log file such as `logs/server.log`.

### logger(options)

  - **options** *object*

      - **path**

        See above

      - All other properties are the meta data included with the logs

### logger.error(request)

`serviceberry-logger` provides a convenient Serviceberry style catch handler if
you'd like to log errors as well.

  - **request** *object*

    Serviceberry request object
