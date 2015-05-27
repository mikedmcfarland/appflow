const assert = require('assert')
const _ = require('lodash')

const DEFAULT_RULES = [
  SomeRule,
  NoneRule,
  TrueRule,
  FalseRule
].map(R=>new R())

function SomeRule(){
  this.match = e => e.label === 'some'
  this.test = v => _.isArray(v) && v.length > 0
}

function NoneRule(){
  this.match = e => e.label === 'none'
  this.test = v => _.isArray(v) && v.length === 0
}

function TrueRule(){
  this.match = e => e.label === 'true'
  this.test = v => _.isBoolean(v) && v
}

function FalseRule(){
  this.match = e => e.label === 'false'
  this.test = v => _.isBoolean(v) && !v
}

function reduceEdges(rules,edges,value){
  return edges.filter(
    edge => {
      const matched = rules.filter(
        r=>r.match(edge))
      assert(matched.length <= 1,'no more then one rule should match an edge')

      return matched.length === 0 ||
        matched[0].test(value)
    })
}

module.exports = {
  TrueRule,FalseRule,SomeRule,NoneRule,
  DEFAULT_RULES,
  reduceEdges,
  reduceEdgesDefault : _.partial(reduceEdges,DEFAULT_RULES)
}
