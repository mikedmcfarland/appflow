const dotParser = require('./dotParser')
const _ = require('lodash')
const Basic = require('./Basic')
const Root = require('./Root')
const EventEmitter = require('events').EventEmitter

function make(structure,nodeDefs = {}){

  const noDef = sNode => Basic(_.identity)
  const nodes = new Map(
    _.pairs(structure.nodes).map(
      ([name,sNode]) => [sNode, nodeDefs[name] ? nodeDefs[name] : noDef(sNode)]))

  const oldCache = _.memoize.Cache
  _.memoize.Cache = WeakMap
  const getEdge = _.memoize(
    sEdge => {
      const edge = _.clone(sEdge)
      edge.head = nodes.get(sEdge.head)
      edge.tail = nodes.get(sEdge.tail)
      return edge
    })
  _.memoize.Cache = oldCache

  function assignProps(sNode,node){
    _.assign(node,sNode)
    node.nodeName = sNode.name

    const sEdges = _.filter(structure.edges,{tail:sNode})

    const edges = sEdges
      .map(getEdge)


    node.edges = edges
  }

  for(let [sNode,node] of nodes){
    assignProps(sNode,node)
  }

  return new Graph(Array.from(nodes.values()))
}

class Graph extends EventEmitter {
  constructor(nodes){
    super()
    this.nodes = _.indexBy(nodes,'nodeName')
    this.activeImpl = () => []
  }

  run(startNode,startValue){
    const onChange = (nodes) => this.emit('change',nodes)
    const root = new Root(onChange)

    const {active,onDone,result} = root(startNode,startValue)

    result.done(v => this.emit('result',v))

    this.activeImpl = active

    return result
  }

  get active(){
    return this.activeImpl()
  }
}

Graph.fromDot =
  (src,nodeDefs) => make(dotParser(src),nodeDefs)

Graph.make = make

module.exports = Graph
