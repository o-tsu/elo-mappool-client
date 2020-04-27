class EloMap {
  constructor (apiResult, pool, api) {
    try {
      this.mapping(apiResult)
      this.pool = pool
      this.api = api
      this.banchoResultReady = false
      this.autoComplete()
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

  duplicate () {
    return new EloMap(this.toApiStruct(), this.pool, this.api)
  }

  update () {
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
    await Object.assign(this, await this.api.apiGetMap(this))
    Object.defineProperty(this, 'submitDate', {
      get: function () {
        if (this._submitDate !== undefined) { return this._submitDate }

        this._submitDate = new Date(this.raw_submitDate + ' UTC')
        return this._submitDate
      }
    })
    Object.defineProperty(this, 'approvedDate', {
      get: function () {
        if (this._approvedDate !== undefined) { return this._approvedDate }

        this._approvedDate = this.raw_approvedDate ? new Date(this.raw_approvedDate + ' UTC') : null
        return this._approvedDate
      }
    })
    Object.defineProperty(this, 'lastUpdate', {
      get: function () {
        if (this._lastUpdate !== undefined) { return this._lastUpdate }

        this._lastUpdate = new Date(this.raw_lastUpdate + ' UTC')
        return this._lastUpdate
      }
    })
    this.banchoResultReady = true
  }

  async autoComplete () {
    if (this.api.autoComplete) {
      const result = this.api.validateMap(this)
      if (!result.complete) {
        await this.banchoResult()
      }
    }
  }
}

exports.EloMap = EloMap
