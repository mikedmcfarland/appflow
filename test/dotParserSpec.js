const assert = require('assert')
const dotParser = require('../lib/dotParser')
const _ = require('lodash')

describe('dotParser',function(){
  it('should parse dot files nodes',()=>{
    const src = `
      digraph graph {
        a -> b
        b -> c
        c -> a
      }
      `
    const info = dotParser(src)
    const expectedNodes = ['a','b','c']
    const nodes = _.values(info.nodes)

    assert.equal(nodes.length,3)
    assert(expectedNodes.every(
      e=>nodes.some(
        n=>n.name===e)))

  })

  it('should parse dot file node edges',()=>{
    const src = `
      digraph graph {
        a -> b

        c->a
        c->b
      }
    `
    const info = dotParser(src)
    const edges = info.edges
    const expectedEdges = [
      ['a','b'],
      ['c','a'],
      ['c','b']
    ].map(names => names.map(name=>({name})))

    expectedEdges.forEach(([tail,head]) =>{
      const edge = _.find(edges,{tail,head})
      assert(edge !== undefined)
    })

  })

  it('should parse dot files edge attributes',()=>{
    const src = `
      digraph graph {
        a -> b [label="edgeLabel"]
      }
    `
    const info = dotParser(src)

    const tail = {name:'a'}
    const head = {name:'b'}
    const expectedEdge = {head,tail,label:"edgeLabel"}
    assert.deepEqual(info.edges,[expectedEdge])
  })

  it('should parse dot files node attributes',()=>{
    const src = `
      digraph graph {
        a [label="nodeLabel"]
      }
    `
    const info = dotParser(src)
    const expectedNode = {name:'a',label:'nodeLabel'}
    assert.deepEqual(info.nodes.a,expectedNode)
  })

  it('should apply node names transforms',()=>{
    const src = `
    digraph graph {
      "a node"
      "b--"
      "c?"
    }
    `
    const info = dotParser(src)
    const expected = {
      aNode: {name:'aNode'},
      bDecrement: {name:'bDecrement'},
      cQ: {name:'cQ'}
    }

    assert.deepEqual(info.nodes,expected)
  })

})
