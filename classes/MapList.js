import { EloMap } from './EloMap'

class MapList {
  constructor (maps, pool, api) {
    this.maps = maps
    this.pool = pool
    this.api = api
  }

  toApiStruct () {
    return this.maps.map(beatmap => beatmap.toApiStruct())
  }


  addMap (beatmap) {
    if (beatmap instanceof Map) {
      return this.maps.push(beatmap)
    } else {
      try {
        return this.maps.push(new EloMap(beatmap, this.pool, this.api))
      } catch (error) {
        throw new Error('not a Map instance')
      }
    }
  }

  diff (newMapList) {
    const notInBoth = newMapList.maps.filter(beatmap => !this.maps.includes(beatmap)).concat(this.maps.filter(beatmap => !newMapList.maps.includes(beatmap)))
    return new MapList(notInBoth, this.pool, this.api)
  }

  upload () {
    return this.api.uploadMapListIntoPool(this, this.pool)
  }

  deleteAll () {
    const result = this.maps.map(beatmap => beatmap.delete())
    this.maps = []
    return result
  }

  duplicate () {
    // const copy = JSON.parse(JSON.stringify(this.maps))
    const copy = this.maps.map(map => map.duplicate())

    return new MapList(copy, this.pool, this.api)
  }

  async banchoResults () {
    await Promise.all(this.maps.map(beatmap => beatmap.banchoResult()))
    return this
  }
}

exports.MapList = MapList
