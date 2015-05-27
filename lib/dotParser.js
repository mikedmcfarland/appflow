const _ = require('lodash')
const dot = require('dotgraph')
const changeCase = require('change-case')

function parse(src){
  const ast = dot.Parser.parse(src)
  const graph = new dot.Graph(ast)
  graph.walk()
  let { nodes,edges } = graph

  const nameTransforms = [
    name => name.replace('?','Q'),
    name => name.replace('--','Decrement'),
    name => changeCase.camelCase(name)]

  //cleanup nodes (add name and merge props)
  Object.keys(nodes).forEach(oldName => {
    const {attrs} = nodes[oldName]
    const name = nameTransforms.reduce(
      (a,b) => b(a),oldName)
    delete nodes[oldName]

    nodes[name] = _.extend({name},attrs)
  })

  //cleanup edges (no nested structure and merge props)
  edges = _(_.values(edges))
    .flatten()
    .map(({edge,attrs}) => {
      const edgeNodes = edge.map(n => nodes[n])
      const [tail,head] = edgeNodes
      return _.extend({tail,head},attrs)
    })
    .value()

  return {nodes,edges}
}

module.exports = parse
