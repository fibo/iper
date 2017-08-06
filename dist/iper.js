require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports=function(x){return (typeof x==='undefined')||(x === null)}

},{}],2:[function(require,module,exports){
/**
 * @param {Object} obj
 * @returns {Function}
 */
function staticProps (obj) {
  /**
   * @param {Object} props
   * @param {Boolean} [enumerable]
   */
  return function (props, enumerable) {
    var staticProps = {}
    for (var propName in props) {
      var staticProp = {
        configurable: false,
        enumerable: enumerable
      }
      var prop = props[propName]
      if (typeof prop === 'function') {
        staticProp.get = prop
      } else {
        staticProp.value = prop
        staticProp.writable = false
      }
      staticProps[propName] = staticProp
    }
    Object.defineProperties(obj, staticProps)
  }
}
module.exports = exports.default = staticProps

},{}],3:[function(require,module,exports){
// In browserify context, fall back to a no op.
module.exports = function (cb) { cb() }

},{}],4:[function(require,module,exports){
'use strict';var _createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}var no=require('not-defined'),staticProps=require('static-props'),getDegree=require('./getDegree'),getIncidentEdgeIds=require('./getIncidentEdgeIds'),_getRank=require('./getRank'),Graph=function(){function a(){var b=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};_classCallCheck(this,a);var c={edges:b.edges||{},nodes:b.nodes||{}},d=[];if(Object.keys(c.edges).forEach(function(a){c.edges[a].forEach(function(a){no(c[a])&&d.push(a)})}),0<d.length)throw new TypeError('Orphan nodes found '+d.join(','));if(b.uniform){if(!Number.isInteger(b.uniform))throw new TypeError('Argument uniform must be an integer');else if(2>b.uniform)throw new TypeError('Argument uniform cannot be less than 2');else c.uniform=b.uniform;var e={};if(Object.keys(c.edges).forEach(function(a){c.edges[a].length!==c.uniform&&(e[a]=c.edgeId[a])}),0<Object.keys(e).length)throw new TypeError('Graph is not '+c.uniform+'-uniform '+JSON.stringify(e))}!0===b.multigraph&&(c.multigraph=!0),!0===b.pseudograph&&(c.multigraph=!0,c.pseudograph=!0);staticProps(this)(c,!0)}return _createClass(a,[{key:'addEdge',value:function addEdge(a){var b=this;if(2>a.length)throw new Error('An edge must point at two or more nodes');var c=this.uniform;if(c){var f=a.length;if(c!==f)throw new Error('Cannot add an edge with cardinality '+f+' to a '+c+'-uniform graph')}if(!this.pseudograph){var g=a.filter(function(b,c){return a.indexOf(b)===c}),h=g.length<a.length;if(h)throw new Error('This is not a pseudograph, it is not allowed to create loops')}if(!this.multigraph)for(var i in this.edges){var j=this.edges[i],k=JSON.stringify(a)===JSON.stringify(j);if(k)throw new Error('This is not a multigraph, you cannot add duplicated edges')}var d=a.filter(function(a){return!b.nodes.hasOwnProperty(a)});if(0<d.length)throw new Error('Edge points to some nodeId not found in this graph; '+d.join(','));var e=this._generateUniqueId();return this.edges[e]=a,e}},{key:'addNode',value:function addNode(a){var b=this._generateUniqueId();return this.nodes[b]=a,b}},{key:'degreeOf',value:function degreeOf(a){return getDegree(this.edges,a)}},{key:'delEdge',value:function delEdge(a){delete this.edges[a]}},{key:'delNode',value:function delNode(a){var b=this;delete this.nodes[a];var c=getIncidentEdgeIds(this.edges,a);c.forEach(function(c){for(;-1<b.edges[c].indexOf(a);)b.edges[c].splice(b.edges[c].indexOf(a),1);2>b.edges[c].length&&b.delEdge(c)})}},{key:'generateId',value:function generateId(){for(var a='';a.length<4;)a+=String.fromCharCode(97+Math.floor(26*Math.random()));return result}},{key:'_generateUniqueId',value:function _generateUniqueId(){var a=this.generateId();return no(this.edges[a])&&no(this.nodes[a])?a:this._generateUniqueId()}},{key:'getRank',value:function getRank(){return this.uniform?this.uniform:_getRank(this.edges)}}]),a}();module.exports=Graph;

},{"./getDegree":5,"./getIncidentEdgeIds":6,"./getRank":7,"not-defined":1,"static-props":2}],5:[function(require,module,exports){
"use strict";var getDegree=function(a,b){var c=0,d=function(a){a===b&&c++};return Object.values(a).forEach(function(a){return a.forEach(d)}),c};module.exports=getDegree;

},{}],6:[function(require,module,exports){
"use strict";var getIncidentEdgeIds=function(a,b){var c=[],d=function(a,b,d){var e=0>c.indexOf(a);d===b&&e&&c.push(a)};for(var e in a){var f=a[e];f.forEach(d.bind(null,e,b))}return c};module.exports=getIncidentEdgeIds;

},{}],7:[function(require,module,exports){
"use strict";var getRank=function(a){var b=0;return Object.values(a).forEach(function(a){b=Math.max(b,a.length)}),b};module.exports=getRank;

},{}],"iper":[function(require,module,exports){
'use strict';require('strict-mode')(function(){exports.Graph=require('./Graph')});

},{"./Graph":4,"strict-mode":3}]},{},[]);
