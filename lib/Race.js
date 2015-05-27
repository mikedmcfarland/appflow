const Promise = require('promise')
const reduceEdges = require('./rules').reduceEdgesDefault
const _ = require('lodash')

function Race(){
  return (self,inValue) => {
    const edges = reduceEdges(self.edges,inValue)
    const children = _.pluck(edges,'head')

    const childrenApplied = children.map(child=>child(child,inValue))

    const result = Promise.race(
      _.pluck(childrenApplied,'result')
    )

    const onDone = _.once(
      () => _.pluck('onDone',childrenApplied)
        .filter(d=>d!==undefined)
        .forEach(d => d()))

    const childrenActives = _.pluck(childrenApplied,'active')

    const active = () => childrenActives.reduce((a,b) => a().concat(b()))

    return {active,result,onDone}
  }
}

module.exports = Race
