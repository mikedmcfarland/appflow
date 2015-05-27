const appflow = require('../lib/')
const glob = require('glob')
const fs = require('fs')
const _ = require('lodash')

function loadGraphs(){
  const dotFileNames = glob.sync("test/*.dot")
  const graphs = dotFileNames.map(filename => {
    const dotSrc = fs.readFileSync(filename,'utf8')
    const name = filename
      .replace('test/','')
      .replace('.dot','')

    const constructor = defs => appflow.Graph.fromDot(dotSrc,defs)

    return {constructor,name}
  })

  return _(graphs)
    .indexBy('name')
    .mapValues(({constructor})=>constructor)
    .value()

}
module.exports = {
  loadGraphs}
