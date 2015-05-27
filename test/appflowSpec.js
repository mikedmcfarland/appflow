// [[file:~/projects/raindance/modules/appflow/test/specs.org::*specs%20start][specs\ start:1]]
const specsUtil = require('./specsUtil')
const assert    = require('assert')
const Basic = require('../lib/Basic')
const Race = require('../lib/Race')
const Event = require('../lib/Event')
const _ = require('lodash')
const Promise = require('promise')

const graphs = specsUtil.loadGraphs()

function assertEndsWith(graphResult,expectedNode,expectedValue){
  return graphResult.then(({node,value}) => {
    assert.equal(node,expectedNode)
    assert.equal(value.value,expectedValue)
  })
}

const getNextChange = graph =>
  new Promise(fulfill => graph.once('change',fulfill))


describe('describe appflow',()=>{
// specs\ start:1 ends here
// [[file:~/projects/raindance/modules/appflow/test/specs.org::*Basic%20Node%20Default][Basic\ Node\ Default:1]]
it('Completion of one node starts next ',()=>{
    const graph = graphs.startsNext()
    const {start,next} = graph.nodes
    assertEndsWith(
      graph.run(start),
      next)
  })
// Basic\ Node\ Default:1 ends here
// [[file:~/projects/raindance/modules/appflow/test/specs.org::*With%20(v%20%3D>%20promise)][With\ \(v\ =>\ promise\):1]]
it('basic nodes can be represented with fn\'s that return promises', ()=>{
    const graph = graphs.startsNext({
      start: Basic(() => Promise.resolve())
    })

    const {start,next} = graph.nodes
    assertEndsWith(
      graph.run(start),
      next)

  })
// With\ \(v\ =>\ promise\):1 ends here
// [[file:~/projects/raindance/modules/appflow/test/specs.org::*Spec][Spec:1]]
it('Nodes can be filtered with true',()=>{
  const graph = graphs.filtered({
    producesBool : Basic(() => Promise.resolve(true))
  })

  const {start,a} = graph.nodes
  return assertEndsWith(
    graph.run(start),
    a,
    true)
})

it('Nodes can be filtered with false',()=>{
  const graph = graphs.filtered({
    producesBool : Basic(() => Promise.resolve(false))
  })

  const {start,b} = graph.nodes
  return assertEndsWith(
    graph.run(start),
    b,
    false)
})
// Spec:1 ends here
// [[file:~/projects/raindance/modules/appflow/test/specs.org::*Spec][Spec:1]]
it('Nodes can be filtered by some and none',()=>{
  const some = ['a value']
  const graph = graphs.someAndNone({
    producesArray : Basic(() => Promise.resolve(some))
  })
  const {start,a} = graph.nodes

  return assertEndsWith(
    graph.run(start),
    a,
    some)
})

it('Nodes can be filtered by none',()=>{
  const none = []
  const graph = graphs.someAndNone({
    producesArray : Basic(() => Promise.resolve(none))
  })
  const {start,b} = graph.nodes

  return assertEndsWith(
    graph.run(start),
    b,
    none)

})
// Spec:1 ends here
// [[file:~/projects/raindance/modules/appflow/test/specs.org::*Spec][Spec:1]]
it('Nodes under a race ',()=>{

  let afulfill;
  let bfulfill;

  const graph = graphs.race({
    race: Race(),
    a: Basic(() => new Promise(fulfill => afulfill = fulfill)),
    b: Basic(() => new Promise(fulfill => bfulfill = fulfill))
  })

  const {race,a,a2,b,b2} = graph.nodes

  const getNext = _.partial(getNextChange,graph)

  const test = getNext(graph).then(nodes => {
    const expected = [race,a,b]
    assert(_.contains(nodes,...expected),'race a and b are active')
    afulfill()
    return getNext()

  }).then(nodes =>{
    assert.deepEqual(nodes, [a2],'a2 is active')
  })

  graph.run(race)
  return test

})
// Spec:1 ends here
// [[file:~/projects/raindance/modules/appflow/test/specs.org::*Spec][Spec:1]]
const EventEmitter = require('events').EventEmitter

it('Event node uses connected node name as default event type',()=>{

  const eventEmitter = new EventEmitter()
  const graph = graphs.event({
    event: Event(()=>eventEmitter)
  })

  const {event,a}  = graph.nodes

  const test = assertEndsWith(
    graph.run(event),
    a)

  eventEmitter.emit('a')
  return test

})

it('Event node uses label of edge if present',()=>{

  const eventEmitter = new EventEmitter()
  const graph = graphs.event({
    event: Event(()=>eventEmitter)
  })

  const {event,someOtherName}  = graph.nodes

  const test = assertEndsWith(
    graph.run(event),
    someOtherName)

  eventEmitter.emit('c')
  return test

})

it('Event node uses filter if present',()=>{

  const eventEmitter = new EventEmitter()

  const filter = ({type,value}) =>
    type !== 'a' && value !== 'fail'

  const graph = graphs.event({
    event: Event(()=>eventEmitter,filter)
  })

  const {event,a,b}  = graph.nodes

  const test = assertEndsWith(
    graph.run(event), b)

  eventEmitter.emit('a','fail')
  eventEmitter.emit('b')
  return test

})
// Spec:1 ends here
// [[file:~/projects/raindance/modules/appflow/test/specs.org::*specs%20end][specs\ end:1]]
})
// specs\ end:1 ends here
