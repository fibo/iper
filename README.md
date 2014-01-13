iper
====

Hypergraphs for Node.js

[![Build Status](https://travis-ci.org/fibo/iper.png?branch=master)](https://travis-ci.org/fibo/iper.png?branch=master)

What is an hypergraph?

An hypergraph is a graph which rank can be greater than two.

Check the following Wikipedia pages:

* [Hypergraph](https://en.wikipedia.org/wiki/Hypergraph)
* [Graph theory](https://en.wikipedia.org/wiki/Graph_theory)

# Installation

    npm install iper

# Documentation

See [examples with annotated sources](http://fibo.github.io/iper).

# Quick start

    var iper = require('iper');

    var IperGraph = iper.IperGraph;

    var graph = new IperGraph();

    var fooNodeId = graph.createNode('foo');
    var barNodeId = graph.createNode(['bar']);
    var quzNodeId = graph.createNode({quz:'quuz'});

    var edgeId = graph.createEdge([fooNodeId, barNodeId]);
    var tripleEdgeId = graph.createEdge([fooNodeId, barNodeId, quzNodeId]);

    console.log(graph.data);

    // graph data should be something like
    //
    // nodes:{
    //   fooNodeId: 'foo',
    //   barNodeId: ['bar'],
    //   quzNodeId: {quz:'quuz'}
    // },
    // edges: {
    //   edgeId: [fooNodeId, barNodeId],
    //   tripleEdgeId: [fooNodeId, barNodeId, quzNodeId]
    // }
    //
    // that is, depending on id assignment, something similar to
    //
    // nodes:{
    //   1: 'foo',
    //   2: ['bar'],
    //   3: {quz:'quuz'}
    // },
    // edges: {
    //   4: [1, 2],
    //   5: [1, 2, 3]
    // }



[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/fibo/iper/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

