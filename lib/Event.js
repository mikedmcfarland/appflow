const Promise = require('promise')

function Event(getEmitter,filter,$onDone){
  filter = filter || (v => true)

  const active = () => []

  return (self,inValue) => {

    let subscriptions
    const emitter = getEmitter(inValue)

    const result = new Promise((fulfill,reject)=>{
      subscriptions = self.edges.map(edge => {
        const type = getEdgeEventType(edge)
        const node = edge.head
        const handler = value => {
          if(filter({type,value})){
            fulfill({node,value})
          }
        }
        return {type,handler}
      })

      subscriptions.forEach(({type,handler}) => emitter.on(type,handler))
    })

    const onDone = () => {
      subscriptions.forEach(
        ({type,handler}) => emitter.removeListener(type,handler))

      if($onDone)
        $onDone()
    }

    return {result,onDone,active}
  }
}

function getEdgeEventType(edge){
  return (edge.label) ?
    edge.label.replace(/^'|'$/g,'') : edge.head.nodeName
}

module.exports = Event
