const { EloMap } = require('./EloMap')

export class MapList {
  constructor (maps, pool, api) {
    this.maps = maps
    this.pool = pool
    this.api = api
  }

  toApiStruct () {
    return this.maps.map(map => map.toApiStruct())
  }
  addMap (map) {
    if (map instanceof Map) {
      return this.maps.push(map)
    } else {
      try {
        return this.maps.push(new EloMap(map, this.pool, this.api))
      } catch (error) {
        throw new Error('not a Map instance')
      }
    }
  }
  diff (newMapList) {
    const notInBoth = newMapList.maps.filter(map => !this.maps.includes(map)).concat(this.maps.filter(map => !newMapList.maps.includes(map)))
    return new MapList(notInBoth, this.pool, this.api)
  }
  upload () {
    return this.api.uploadMapListIntoPool(this, this.pool)
  }
  deleteAll () {
    const result = this.maps.map(map => map.delete())
    this.maps = []
    return result
  }
  duplicate () {
    // const copy = JSON.parse(JSON.stringify(this.maps))
    const copy = this.maps.map(map => map.duplicate())

    return new MapList(copy, this.pool, this.api)
  }
}
