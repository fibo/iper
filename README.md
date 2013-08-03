iper
====

Hypergraphs for Node.js

[![Build Status](https://travis-ci.org/fibo/iper.png)](https://travis-ci.org/fibo/iper)

# Quick start

    var iper = require('iper');

    var IperGraph = iper.IperGraph;

    var graph = new IperGraph();

    var fooNode = graph.createNode('foo');
    var barNode = graph.createNode('bar');
    var quzNode = graph.createNode('quz');

    var tripleEdge = graph.createEdge([fooNode, barNode, quzNode])


