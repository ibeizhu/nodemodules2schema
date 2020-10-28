## nodemodules2schema [![NPM version](https://img.shields.io/npm/v/nodemodules2schema.svg?style=flat)](https://www.npmjs.com/package/nodemodules2schema) [![NPM monthly downloads](https://img.shields.io/npm/dm/nodemodules2schema.svg?style=flat)](https://npmjs.org/package/nodemodules2schema) [![NPM total downloads](https://img.shields.io/npm/dt/nodemodules2schema.svg?style=flat)](https://npmjs.org/package/nodemodules2schema)

traverse node_modules and look up all packages to json schema

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save nodemodules2schema
```

## Usage

```js
const nodemodules2schema = require('nodemodules2schema);
const projectDir = "/my/project1";
const options = { 
  // depth: 5, // traverse node_modules max depth
  // dependenciesKey: "children", // Customize schema key
};
const schema = nodemodules2schema(projectDir, options);
```

schema 
```json

{
  "dependencies": [
    {
      "dependencies": [
        {
          "dependencies": [
            {
              "dependencies": [],
              "name": "isobject",
              "version": "3.0.1"
            }
          ],
          "name": "is-plain-object",
          "version": "2.0.4"
        }
      ],
      "name": "set-value",
      "version": "3.0.2"
    },
    {
      "dependencies": [],
      "name": "universalify",
      "version": "1.0.0"
    }
  ],
  "name": "nodemodules2schema",
  "version": "1.0.0"
}
```

### Params

* `projectDir` **{string}**: the project directory to traverse 
* `options` **{object}**: options for nodemodules2schema
  - `depth` **{number}**: traverse node_modules max depth, default value `8`
    - **Attention:** node_modules is a black hole, sometimes may be positive infinity and lead to memory overflow
  - `dependenciesKey` **{string}**: schema key, default value `'dependencies'`
