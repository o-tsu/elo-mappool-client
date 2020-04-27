import { MapList } from './MapList'

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
      submitter: this.submitter,
      creator: this.creator,
      status: this.status,
      description: this.description,
      recommendElo: this.recommendElo,
      cover: this.cover
    }
  }

  // res = api data(jsonify)
  mapping (res) {
    this.id = res.id
    this.name = res.mappool_name
    this.submitter = res.submitter
    this.creator = res.creator
    this.oldName = this.name
    this.status = res.status
    this.description = res.description
    this.recommendElo = res.recommend_elo
    this.cover = res.cover
  }

  getVotes () {
    return this.api.getPoolVotes(this)
  }

  // asnyc-------------------------------------------------------

  async getMaps () {
    const pool = await this.api.getMapsInPool(this)
    this.maps = new MapList(pool, this, this.api)
    const copy = this.maps.duplicate()
    return copy
  }

  async delete () {
    // if (this.id > 0) return this.api.deletePoolByPoolId(this);
    // else
    if (this.name) return this.api.deletePoolByPoolName(this)
    else throw new Error('invalid pool.')
  }

  async update () {
    return this.api.editPoolByPoolName(this).then(result => {
      if (result) this.mapping(result)
      else throw new Error('update failed')
    })
  }
}

exports.Pool = Pool
