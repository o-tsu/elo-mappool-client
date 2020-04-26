export class EloMap {
  constructor (apiResult, pool, api) {
    try {
      this.mapping(apiResult)
      this.pool = pool
      this.api = api
    } catch (error) {
      throw error
    }
  }

  toApiStruct () {
    return {
      map_id: this.id,
      mod: this.mod,
      mod_index: this.index,
      stage: this.stage,
      selector: this.selector
    }
  }

  mapping (apiResult) {
    this.id = apiResult.map_id
    this.mod = apiResult.mod
    this.index = apiResult.mod_index
    this.stage = apiResult.stage
    this.selector = apiResult.selector
  }

  async update () {
    try {
      this.api.deleteMapFromPool(this, this.pool)
      return this.api.uploadMapsIntoPool([this], this.pool)
    } catch (error) {
      throw error
    }
  }

  async delete () {
    return this.api.deleteMapFromPool(this, this.pool)
  }
}
