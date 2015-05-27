const Graph = require('../lib/Graph')
const assert = require('assert')
const _ = require('lodash')
const Basic = require('../lib/Basic')

describe('Graph',function(){

  it('make, should create a graph from structure', () => {

    const a = {name:'a'}
    const b = {name:'b'}
    const nodes = {a,b}

    const edges = [
      {tail:a,head:b}
    ]
    const structure = {nodes,edges}
    const graph = Graph.make(structure)


    const nodeB = graph.nodes.b
    assert(nodeB !== undefined)

    const nodeA = graph.nodes.a
    assert(nodeA !== undefined)
    assert.equal(nodeA.edges.length,1)

    const {tail,head} = nodeA.edges[0]
    assert.equal(tail,nodeA)
    assert.equal(head,nodeB)

  })

  it('fromDot creates a graph using dot syntax ',() =>{
    const graph = Graph.fromDot(
      `
      digraph fromDot {
        a -> b
      } `
    )

    const {a,b} = graph.nodes

    assert(b !== undefined)

    assert(a !== undefined)
    assert.equal(a.edges.length,1)

    const {tail,head} = a.edges[0]
    assert.equal(tail,a)
    assert.equal(head,b)
  })

  it('handle graphs generated with multiple edges with predicates',() =>{
    const graph = Graph.fromDot(
      `
      digraph graph {
        a -> b
        b -> c [label="true"]
        b -> d [label="false"]
      }`
    )

    const {a,b,c,d} = graph.nodes
    const expectedNodes = [a,b,c,d]
    expectedNodes.forEach(n => assert(n !== undefined))

    assertEdges(a,[
      {tail:a,head:b},
    ])

    assertEdges(b,[
      {tail:b,head:c,label:'true'},
      {tail:b,head:d,label:'false'}
    ])

    function assertEdges(node,expectedEdges){
      assert.equal(node.edges.length,expectedEdges.length)

      const result =
        node.edges.every(
          actual => expectedEdges.some(
            expected => _.matches(actual)(expected))
        )

      assert(result)
    }

  })

  it('graphs dispatch change event',() => {
    const graph = Graph.fromDot(
      `
      digraph fromDot {
        a -> b
      } `)

    return new Promise(
      (fulfill) => {
        graph.on('change',v => fulfill(v))
        graph.run(graph.nodes.a)
      })
      .then(v => {
        assert.deepEqual(v,[graph.nodes.a])
      })

  })

  it('graphs update active', (done) => {
    let afulFill
    let bfulFill
    const a = Basic(v => new Promise(f => afulFill=f ))
    const b = Basic(v => new Promise(f => bfulFill=f ))
    const graph = Graph.fromDot(
      `
      digraph fromDot {
        a -> b
      } `,
      {a,b}
    )

    assert.deepEqual(graph.active,[])

    graph.run(a)

    _.defer(() => {
      assert.deepEqual(graph.active,[a])
      afulFill()

      _.defer(() => {
        assert.deepEqual(graph.active,[b])
        bfulFill()

        _.defer(() => {
          assert.deepEqual(graph.active,[])
          done()
        })
      })
    })
  })

})
