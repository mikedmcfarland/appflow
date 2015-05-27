const assert = require('assert')
const reduceEdges = require('./rules').reduceEdgesDefault
const Promise = require('promise')

function Basic(task,onDone){
  if(!task)
    task = v => v

  const active = () => []

  return (self,inValue) => {

    const result = Promise.resolve(inValue)
      .then(task)
      .then(value => {
        const edges = reduceEdges(self.edges,value)
        assert(edges.length <= 1,'basic nodes only move to one node next')

        return (edges.length === 0) ?
          {value} : {node:edges[0].head,value}
      })

    return {onDone,active,result}
  }
}

module.exports = Basic
