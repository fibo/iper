---
title: iper
---
# iper

> Hypergraphs for breakfast!

[![Node engine](https://img.shields.io/node/v/iper.svg)](https://nodejs.org/en/) [![NPM version](https://badge.fury.io/js/iper.svg)](http://badge.fury.io/js/iper) [![Build Status](https://travis-ci.org/fibo/iper.svg?branch=master)](https://travis-ci.org/fibo/iper?branch=master) [![Dependency Status](https://gemnasium.com/fibo/iper.svg)](https://gemnasium.com/fibo/iper) [![Coverage Status](https://coveralls.io/repos/fibo/iper/badge.svg?branch=master)](https://coveralls.io/r/fibo/iper?branch=master) [![Test page](https://img.shields.io/badge/test-page-blue.svg)](http://g14n.info/iper/test)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

[![NPM](https://nodei.co/npm-dl/iper.png)](https://nodei.co/npm-dl/iper/)

## Installation

With [npm](https://npmjs.org/) do

```
npm install iper
```

With [bower](http://bower.io/) do

```bash
$ bower install iper
```

## API

### new Graph([graph])

> Hypergraph

```
var graph = new Graph()
```

|                 |              |
| --------------- | ------------ |
| @param {Object} | [graph]      |
| @param {Object} | [graph.edge] |
| @param {Object} | [graph.node] |

### graph.addEdge(nodeIds)

|                   |         |
| ----------------- | ------- |
| @param {Array}    | nodeIds |
| @returns {String} | id      |

### graph.addNode(data)

|                   |      |
| ----------------- | ---- |
| @param {Any}      | data |
| @returns {String} | id   |

### graph.delEdge(id)

|                  |       |
| ---------------- | ----- |
| @param {String}  |id     |
| @returns {Array} |nodeIds|

### graph.delNode(id)

|                 |      |
| --------------- | ---- |
| @param {String} | id   |
| @returns {Any}  | data |

## License

[MIT](http://www.g14n.info/mit-license)

