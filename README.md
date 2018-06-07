serviceberry-logger
===================

[![CircleCI](https://circleci.com/gh/bob-gray/serviceberry-logger.svg?style=svg)](https://circleci.com/gh/bob-gray/serviceberry-logger)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b427036ce3a06d83d218/test_coverage)](https://codeclimate.com/github/bob-gray/serviceberry-logger/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/b427036ce3a06d83d218/maintainability)](https://codeclimate.com/github/bob-gray/serviceberry-logger/maintainability)
[![npm version](https://badge.fury.io/js/serviceberry-logger.svg)](https://badge.fury.io/js/serviceberry-logger)

A logger plugin for [Serviceberry](https://serviceberry.js.org).

Logs HTTP requests and responses and attaches a child logger to each request at
`request.log`. Loggers are [bunyan](https://www.npmjs.com/package/bunyan) loggers.

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
  - **msg** `request`
  - **id** *string*
  - **method** *string*
  - **host** *string*
  - **url** *string*
  - **headers** *object*

Each response is logged when finished as
  - **msg** `response`
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
request.log.warn({danger: true}, "Watch out!");
```

See [bunyan](https://www.npmjs.com/package/bunyan) for more details.


Reference
---------

`serviceberry-logger` can be called with one of two signatures.

### logger(path)

  - **path** *string*

    The path to the log file. Defaults to `logs/server.log`. When the plugin is called
	with a path the bunyan logger options are set as follows.

	- **name:** *path basename (ie...server)*
	- **streams:** *array*
	  - **type:** `rotating-file`
	  - **path:** *path*
	  - **period:** `1d`
	  - **count:** `5`

### logger(options)

  - **options** *object*

    If the stock options above are not what you want, you can pass in your own
	options. See [bunyan](https://www.npmjs.com/package/bunyan) for options
	documentation. These options are passed through to `bunyan.createLoggger`.

### logger.error(request)

`serviceberry-logger` provides a convenient Serviceberry style catch handler if
you'd like to log errors as well.

  - **request** *object*

    Serviceberry request object
