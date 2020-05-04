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
    return EloMap.toApiStructStatic(this)
  }

  static toApiStructStatic (map) {
    return {
      map_id: map.id,
      mod: map.mod,
      mod_index: map.index,
      stage: map.stage,
      selector: map.selector
    }
  }

  mapping (apiResult) {
    this.id = apiResult.map_id
    this.mod = (typeof apiResult.mod == 'string') ? apiResult.mod.toString().match(/.{1,2}/g) : apiResult.mod
    this.index = apiResult.mod_index
    this.stage = apiResult.stage
    this.selector = apiResult.selector
  }

  duplicate () {
    return new EloMap(this.toApiStruct(), this.pool, this.api)
  }

  static create (map, pool, api) {
    const apiResult = EloMap.toApiStructStatic(map)
    return new EloMap(apiResult, pool, api)
  }
  async upload () {
    return this.api.uploadMapsIntoPool([this], this.pool)
  }
  async update () {
    try {
      await this.delete();
      return this.upload();
    } catch (error) {
      throw error
    }
  }

  async delete () {
    return this.api.deleteMapFromPool(this, this.pool)
  }

  async banchoResult () {
    const self = Object.assign({}, this)
    await Object.assign(self, await self.api.apiGetMap(this))
    Object.defineProperty(self, 'submitDate', {
      get: function () {
        if (self._submitDate !== undefined) { return self._submitDate }

        self._submitDate = new Date(self.raw_submitDate + ' UTC')
        return self._submitDate
      }
    })
    Object.defineProperty(self, 'approvedDate', {
      get: function () {
        if (self._approvedDate !== undefined) { return self._approvedDate }

        self._approvedDate = self.raw_approvedDate ? new Date(self.raw_approvedDate + ' UTC') : null
        return self._approvedDate
      }
    })
    Object.defineProperty(self, 'lastUpdate', {
      get: function () {
        if (self._lastUpdate !== undefined) { return self._lastUpdate }

        self._lastUpdate = new Date(self.raw_lastUpdate + ' UTC')
        return self._lastUpdate
      }
    })
    self.banchoResultReady = true
    Object.assign(this, self)
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
