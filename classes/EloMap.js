const nodeOsu = require('node-osu')
export class EloMap extends nodeOsu.Beatmap {
  constructor (apiResult, pool, api) {
    try {
      this.mapping(apiResult)
      this.pool = pool
      this.api = api
      this.banchoResultReady = false
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

  duplicate(){
    return new EloMap(this.toApiStruct(),this.pool,this.api);
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

  async banchoResult () {
    await Object.assign(await this.api.apiGetResult(this), this);
    this.banchoResultReady = true;
  }

  async autoComplete () {
    if (this.api.autoComplete){
        const result = this.api.validateMap(this)
        if (!result.complete) {
          await this.banchoResult()
        }
      }
  }
}
