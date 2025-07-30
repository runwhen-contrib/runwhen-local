# auth-header

Deal with obscene HTTP `Authorization` and `WWW-Authenticate` headers.

![build status](http://img.shields.io/travis/izaakschroeder/auth-header.svg?style=flat&branch=master)
![coverage](http://img.shields.io/coveralls/izaakschroeder/auth-header.svg?style=flat&branch=master)
![license](http://img.shields.io/npm/l/auth-header.svg?style=flat&branch=master)
![version](http://img.shields.io/npm/v/auth-header.svg?style=flat&branch=master)
![downloads](http://img.shields.io/npm/dm/auth-header.svg?style=flat&branch=master)

| Type          | Parse   | Format  |
| ------------- | ------- | ------- |
| Basic         |    ✓    |    ✓    |
| Digest        |    ✓    |    ✓    |
| AWS           |    ✓    |    ✓    |
| Bearer/OAuth  |    ✓    |    ✓    |
| [RFC7235]     |    ✓    |    ✓    |

***Note***: If you're looking for an all-on-one solution to do authentication against these headers check out [express-authentication-header] which uses this library behind the scenes.

The HTTP `Authorization` and `WWW-Authenticate` family of headers are both pretty nightmareish; there has been, up until recently, no wide consensus about how they should be formatted and so parsing them is lots of fun if fun is pulling your hair out.

This library provides an implementation of [RFC7235] which allows for the parsing of many known existing authorization headers (like Basic and Digest) as well as any future ones which follow the standard. Noteably, this library is less strict than it could be to parse some of these legacy formats.

In addition to the format of the header itself being in flux, WWW-Authenticate has its own nasty surprise: sometimes multiple authentication prompts can appear in one header, sometimes they can appear in multiple headers; we _ONLY_ support the latter case since trying to disambiguate between a second prompt and parameters for the first is just about impossible.

```javascript
import * as authorization from 'auth-header';
import express from 'express';

const app = express();

app.get('/', function(req, res) {

	// Something messed up.
	function fail() {
		res.set('WWW-Authenticate', authorization.format('Basic'));
		res.status(401).send();
	}

	// Get authorization header.
	var auth = authorization.parse(req.get('authorization'));

	// No basic authentication provided.
	if (auth.scheme !== 'Basic') {
		return fail();
	}

	// Get the basic auth component.
	var [un, pw] = Buffer(auth.token, 'base64').toString().split(':', 2);

	// Verify authentication.
	if (pw !== 'admin') {
		return fail();
	}

	// We've reached the promise land.
	res.send('Hello world.');
});
```

[RFC7235]: https://tools.ietf.org/html/rfc7235
[express-authentication-header]: https://github.com/izaakschroeder/express-authentication-header
