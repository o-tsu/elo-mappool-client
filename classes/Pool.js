const { MapList } = require('./MapList')

class Pool {
  constructor (res, api) {
    try {
      this.mapping(res)
      this.api = api
    } catch (error) {
      throw error
    }
  }

  // sync-------------------------------------------------------

  getData () {
    return {
      id: this.id,
      name: this.name,
      host: this.host,
      // creator: this.creator,
      status: this.status,
      description: this.description,
      recommendElo: this.recommendElo,
      cover: this.cover,
      rating: this.rating
      // ratingCount: this.ratingCount
    }
  }

  // res = api data(jsonify)
  mapping (res) {
    this.id = res.id
    this.name = res.mappool_name
    this.host = res.host
    // this.creator = res.creator
    this.oldName = this.name
    this.status = res.status
    this.description = res.description
    this.recommendElo = res.recommend_elo
    this.cover = res.cover
    this.rating = res.rating
    // this.ratingCount = res.rating.counts
  }

  // asnyc-------------------------------------------------------

  async getVotes () {
    return this.api.getPoolVotes(this)
  }

  async getMaps () {
    const pool = await this.api.getMapsInPool(this)
    this.maps = new MapList(pool, this, this.api)
    // const copy = this.maps.duplicate()
    // return copy
    return this.maps
  }

  async updateMaps () {
    const maps = await this.api.getMapsInPool(this)
    this.maps.maps.map(bm => {
      const updated = maps.find(updatedBm => updatedBm.id === bm.id && updatedBm.stage === bm.stage && updatedBm.index === bm.index && JSON.stringify(updatedBm.mods) === JSON.stringify(bm.mods))
      if (updated) {
        bm = Object.assign(bm, updated)
      } else {
        console.log('a map was in the mapList now gone', bm)
      }
    })
    // const me = maps.find(map => map.id === this.id && map.stage === this.stage && map.mods === this.mods)
    // this._id = me._id
  }

  async delete () {
    // if (this.id > 0) return this.api.deletePoolByPoolId(this);
    // else
    if (this.name) return this.api.deletePoolByPoolName(this)
    else throw new Error('invalid pool.')
  }

  async update () {
    return this.api.editPoolByPoolName(this).then(result => {
      if (result) {

      }
      return result
    })
  }
}

exports.Pool = Pool
