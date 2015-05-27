const _ = require('lodash')

function Root(onChange){
  return (startNode,startValue) => {
    let current = undefined
    let stopped = false

    function next(inNode,inValue) {

      current = _.assign({node:inNode},inNode(inNode,inValue))

      if(onChange){
        onChange(active())
      }

      const {result,onDone} = current

      return result.then(({node,value}) => {
        if(stopped){
          return undefined
        }
        if(onDone){
          onDone()
        }
        return (node === undefined) ?
          {value} : next(node,value)
      })
    }

    const active = () => current ?
      [current.node].concat(current.active()) : []


    const onDone = () => {
      if(current){
        stopped = true
        current.onDone()
        current = undefined
      }
    }

    const result = next(startNode,startValue)
      .then(value=>{
        const result = {node:current.node,value}
        current = undefined
        return result
      })

    return {active,onDone,result}
  }
}
module.exports = Root
