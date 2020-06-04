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
      object_id: map._id,
      beatmap_id: map.id,
      mods: map.mod,
      mod_index: map.index,
      stage: map.stage,
      selector: map.selector
    }
  }

  mapping (apiResult) {
    this._id = apiResult.object_id
    this.id = apiResult.beatmap_id
    this.mods = (typeof apiResult.mod === 'string') ? apiResult.mod.toString().match(/.{1,2}/g) : apiResult.mods
    this.mod = this.mods // new api uses mods but old api uses mod we just add a refer to mods to support both
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
    const result = await this.api.uploadMapsIntoPool([this], this.pool)
    if (result) {
      const updated = await this.api.getMapInPool(this, this.pool)
      this.mapping(updated)
    }
    return result
  }

  async update () {
    if (this._id) this.api.updateMapFromObjectId(this)
    else throw new Error('not implemented')
    // try {
    //   await this.delete()
    //   return this.upload()
    // } catch (error) {
    //   throw error
    // }
    // await this.api.updateMap(this, this.pool)
    // console.log('not impl')
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
