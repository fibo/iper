iper
====

Hypergraphs for Node.js

[![Build Status](https://travis-ci.org/fibo/iper.png)](https://travis-ci.org/fibo/iper)

What is an hypergraph?

An hypergraph is a graph which rank can be greater than two.

Check the following Wikipedia pages:

* [Hypergraph](https://en.wikipedia.org/wiki/Hypergraph)
* [Graph theory](https://en.wikipedia.org/wiki/Graph_theory)

# Installation

    npm install iper

# Documentation

See [annotated sources](http://fibo.github.io/iper).

# Quick start

    var iper = require('iper');

    var IperGraph = iper.IperGraph;
    var IperEdge  = iper.IperEdge;

    var graph = new IperGraph();

    var fooNodeId = graph.createNode('foo');
    var barNodeId = graph.createNode(['bar']);
    var quzNodeId = graph.createNode({quz:'quuz'});

    var edgeId = graph.createEdge([fooNodeId, barNodeId]);

    var edge = graph.getEdge(edgeId);

    var tripleEdgeId = graph.createEdge([fooNodeId, barNodeId, quzNodeId]);

    var tripleEdge = graph.getEdge(tripleEdgeId);

    console.log(graph.data)

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

