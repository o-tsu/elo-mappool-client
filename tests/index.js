const { User, MapPool, EloMap, MapList } = require('../index')

console.log('start')
async function test () {
  const i = new MapPool({ user: { id: 1123053 } })
  const pools = await i.getPools()
  console.log('pools', pools)
  const testPool = pools.find(pool => pool.name === 'test')
  const descriptionWas = testPool.description
  testPool.description = 'pog'
  console.log('edit test description', await testPool.update())
  testPool.description = descriptionWas
  console.log('revert test description', await testPool.update())
  const mapList = await testPool.getMaps()
  console.log('maps in test', mapList.maps)
  const map = mapList.maps[0]
  console.log('map', map)
  // delete map
  console.log('delete map', await map.delete())
  // upload map
  console.log('upload map', await map.upload())
  console.log('new map', map)
}
test()
