import { MapList } from './MapList'

export class Pool {
  constructor (res, api) {
    try {
      this.mapping(res)
      this.api = api
    } catch (error) {
      throw error
    }
  }

  // sync-------------------------------------------------------

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
    this.maps = new MapList(await this.api.getMapsInPool(this), this, this.api)
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
