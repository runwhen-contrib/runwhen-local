# Vuln/Vects

![CI](https://github.com/security-breachlock/vuln-vects/actions/workflows/main.yml/badge.svg)

A powerful, flexible CVSS parser, calculator and validator written for JavaScript/TypeScript.

![Logo](logo-readme.svg)

## Overview
Vuln/Vects is a library written in TypeScript, targeting JavaScript (server-side [Node.js](https://nodejs.org/en/) or
browser) that aims to provide all the generation, validation, scoring and manipulation functionality you could ever need
when working with CVSS (common vulnerability scoring system) vectors of any version. CVSS v2, v3.0 and v3.1 are
currently supported.

## Installing
Installing the project is very straightforward via [npm](https://www.npmjs.com/):

```bash
npm install --save vuln-vects
```

If you're working in TypeScript and need type annotations etc. you might also want to run:

```bash
npm install --save @types/vuln-vects
```

## Building
It's only necessary to build the project if you're doing development work on it. There's no need to do so if you're just installing it to use as a library. Ensure that [Node.js v14.x](https://nodejs.org/en/) and npm is installed and run:

```bash
npm run build
```

Build output is to `/dist`. To build accompanying documentation, you need the following command:

```bash
npm run docs
```

Documentation is generated using [TypeDoc](https://typedoc.org/) and rendered as HTML to `/docs/api`.

## Bundling
You'll need to bundle the library if you want to use it in-browser (remember to build it first):

```bash
npm run build && npm run bundle
```

This will give you a single file in `/bundle` that you can import into your webpages (see [Usage](#usage) section).

## Running tests
Tests are on [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/). You can run them like so:

```bash
npm run test
```

## Usage
Usage of the library will vary, depending on whether you want to run in-browser or as part of a server-side Node.js project. In any case, you'll need to begin by installing the library:

```bash
npm install --save vuln-vects
```

If you want to do a deep dive on the functionality of the library, take a look at [the full API documentation](https://security-breachlock.github.io/vuln-vects/api).

### In the browser
Usage in the browser is super straightforward. After installation, simply import the bundled library into your webpage like so:

```html
<script src="node_modules/vuln-vects/bundle/vuln-vects.js"></script>
```

You'll then get a `VulnVects` object in the global namespace through which you can use the library:

```html
<script>
    alert(VulnVects.parseCvss2Vector('CVSS2#AV:N/AC:L/Au:N/C:P/I:N/A:N').baseScore); // Shows '5.0'.
</script>
```

### On the server
Importing and invoking the library is slightly different on the server side.

```js
import { parseCvss2Vector } from 'vuln-vects';

console.log(parseCvss2Vector('CVSS2#AV:N/AC:L/Au:N/C:P/I:N/A:N').baseScore); // Prints '5.0'.
```

Aside from this, the API is identical. There is a lot more you can do with the library aside from just the above. See [Features](#features) for more details.

## Features
The library provides 4 main features: validation, scoring, rendering and mocking. If there's anything else you'd like to see, please consider opening an issue.

### Validating
Validation of CVSS vectors of any currently supported version is possible. Convenience methods offer the simplest API for this:

```js
import {
    validateCvss2Vector,
    validateCvss3Vector,
    validateCvssVector
} from 'vuln-vects';

// Will be true on validation success, false on failure.
const isValidCvss2Vector = validateCvss2Vector('(AV:N/AC:L/Au:N/C:P/I:N/A:N)'); // For CVSS v2.
const isValidCvss3Vector = validateCvss3Vector('AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N'); // For CVSS v3.x.
const isValidCvssVector = validateCvssVector('AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N'); // Version-agnostic.
```

Validation, in this context, means that CVSS vectors must be both well-formed and contain all required fields. If a CVSS vector is not well-formed (e.g. is missing separators as in `AV:NAC:LPR:NUI:NS:UC:NI:LA:N`) or does not contain all required fields to compute a score (e.g. does not contain a confidentiality impact as in `AV:N/AC:L/PR:N/UI:N/S:U/I:L/A:N`) validation will fail.

To get more detail about exactly why a vector failed validation, you can use the scoring API. For CVSS v2 vectors for example:

```js
import {
    Cvss2VectorParser
} from 'vuln-vects';

const parser = new Cvss2VectorParser();
const scoringEngine = parser.generateScoringEngine('AV:N/AC:L/Au:N/C:P/I:N'); // Missing availability impact.

const isValid = scoringEngine.isValid(); // Will be true on validation success, false on failure.
const errors = scoringEngine.validate(); // Will return a list of human-readable validation errors.
```

### Scoring
Scoring CVSS vectors (i.e. converting them into a CVSS score from 1-10) is the most common use-case for the library, and as such has been designed to be very convenient to use via helper methods:

```js
import {
    parseCvss2Vector,
    parseCvss3Vector,
    parseCvssVector
} from 'vuln-vects';

// Will yield score objects.
const cvss2VectorScore = parseCvss2Vector('(AV:N/AC:L/Au:N/C:P/I:N/A:N)'); // For CVSS v2.
const cvss3VectorScore = parseCvss3Vector('AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N'); // For CVSS v3.x.
const cvssVectorScore = parseCvssVector('AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N'); // Version-agnostic.

// The resulting score objects contain several subscores, but you probably want base score or overall score.
console.log(cvss2VectorScore.baseScore);
console.log(cvss2VectorScore.overallScore);
```

### Rendering
Rendering CVSS vectors refers to the process of generating CVSS vector strings from a set of metrics. This is a bit more involved, but still not especially complex:

```js
import {
    Cvss2ScoringEngine,
    Cvss2VectorRenderer,
    Cvss2VectorPrefixOption,
    cvss2, // Enums specific to CVSS v2.
} from 'vuln-vects';

// Set up and configure a scoring engine.
const scoringEngine = new Cvss2ScoringEngine();
scoringEngine.accessVector = cvss2.AccessVector.NETWORK;
scoringEngine.accessComplexity = cvss2.AccessComplexity.MEDIUM;
scoringEngine.authentication = cvss2.Authentication.NONE;
scoringEngine.confidentialityImpact = cvss2.Impact.NONE;
scoringEngine.integrityImpact = cvss2.AccessVector.COMPLETE;
scoringEngine.availabilityImpact = cvss2.AccessVector.NONE;

// Feed this to an appropriate vector renderer.
const vectorRenderer = new Cvss2VectorRenderer(Cvss2VectorPrefixOption.BRACKETED);
console.log(vectorRenderer.render(scoringEngine));
```

### Mocking
The ability to randomly generate (i.e. mock) CVSS vectors for use in unit testing application that consume them can be very useful. Convenience methods are provided for this purpose:

```js
import {
    randomCvss2Vector,
    randomCvss3Vector,
    Cvss2VectorPrefixOption
} from 'vuln-vects';

// Shows a random CVSS v2 and v3.x vector.
console.log(randomCvss2Vector());
console.log(randomCvss3Vector());

// Temporal/environmental scores and any valid prefixing scheme are supported:
console.log(randomCvss2Vector(true, true, Cvss2VectorPrefixOption.BRACKETED));
```

## Acknowledgements
The main contributors to this project so far are as follows:

* Saul Johnson ([@lambdacasserole](https://github.com/lambdacasserole))
* Sai Srinivas ([@saikop99](https://github.com/saikop99))
