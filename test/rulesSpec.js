const assert    = require('assert')
const rules = require('../lib/rules')
const Graph = require('../lib/Graph')

describe('rules',function(){
  it('reduceEdgesDefault filters for true/false ',()=>{

    const graph = Graph.fromDot(
      `
      digraph graph {
        a -> b
        b -> c [label="true"]
        b -> d [label="false"]
      }`
    )

    const {a,b,c,d} = graph.nodes

    const trues = rules.reduceEdgesDefault(b.edges,true)
    assert.equal(trues.length,1)

    assert.equal(trues[0].tail,b)
    assert.equal(trues[0].head,c)


    const falses = rules.reduceEdgesDefault(b.edges,false)
    assert.equal(falses.length,1)

    assert.equal(falses[0].tail,b)
    assert.equal(falses[0].head,d)

  })

  it('reduceEdgesDefault filters for some/none ',()=>{

    const graph = Graph.fromDot(
      `
      digraph graph {
        a -> b
        b -> c [label="some"]
        b -> d [label="none"]
      }`
    )

    const {a,b,c,d} = graph.nodes

    const somes = rules.reduceEdgesDefault(b.edges,["a value"])
    assert.equal(somes.length,1)

    assert.equal(somes[0].tail,b)
    assert.equal(somes[0].head,c)


    const nones = rules.reduceEdgesDefault(b.edges,[])
    assert.equal(nones.length,1)

    assert.equal(nones[0].tail,b)
    assert.equal(nones[0].head,d)

  })
})
