const { Pool } = require('./Pool')
const { MapList } = require('./MapList')
const { EloMap } = require('./EloMap')

const xhr = require('./httpio')
const nodeOsu = require('node-osu')

export class MapPool {
  constructor ({
    apiBase = `http://47.101.168.165:5004`,
    autoComplete = false,
    sample = {
      id: null,
      index: null,
      stage: null,
      mod: [],
      selector: undefined,
      submitter: null,
      beatmapSetId: undefined,
      approvalStatus: undefined,
      titie: undefined,
      creator: undefined,
      artist: undefined,
      version: undefined,
      difficulty: {
        rating: -1,
        aim: -1,
        speed: -1,
        size: -1,
        overall: -1,
        approach: -1,
        drain: -1
      },
      length: { total: -1, drain: -1 }
    }
  } = {}) {
    this.base = apiBase
    this.autoComplete = autoComplete
    this.sample = sample
  }

  // sync -----------------------------------------------------------

  apiGetMap (mapped) {
    // console.log(mapped);
    return fetch(`http://47.101.168.165:5005/api/map/${mapped.id}`).then(res => res.json()).then(res => res[0]).then(res => new nodeOsu.Beatmap({ parseNumeric: true }, res))
    // return this.bancho.getBeatmaps({ b: mapped.id }).then(result => result[0]).catch(e => Promise.resolve(mapped));
  }

  mapping (map) {
    return JSON.parse(JSON.stringify(Object.assign(this.sample, {
      id: map.id || null,
      title: map.map_title || undefined,
      creator: map.map_creator || undefined,
      artist: map.map_artist || undefined,
      version: map.map_version || undefined,
      difficulty: Object.assign(this.sample.difficulty, {
        rating: map.difficulty_rating || undefined
      }),
      mod: map.mod || [],
      stage: map.stage || null,
      index: map.mod_index || null,
      selector: map.selector || undefined,
      submitter: map.submitter || null
    })))
  }

  validateMap (mapped) {
    const result = {
      required: false,
      completed: false
    }
    if (Object.entries(mapped).some(([prop, value]) => value === null)) return result
    else if (mapped.mod.length <= 0) return result
    result.required = true
    if (Object.entries(mapped).some(([prop, value]) => value === undefined)) return result
    if (['null', 'undefined'].includes(typeof mapped.difficulty) || ['null', 'undefined'].includes(typeof mapped.length)) return result
    else if ([mapped.difficulty, mapped.length].some((sub) => Object.entries(sub).map(([prop, value]) => value === undefined || value < 0))) return result
    result.completed = true
    return result
  }

  validateMaps (list) {
    return list.map((map) => this.validateMap(map))
  }

  // votes
  getPoolVotes ({ name }, { id = '' } = {}) {
    const url = `${this.base}/pools/${name}/votes/${id}`
    const result = this.httpReq({ url })
    return result
  }

  votePool (upvote, pool, user) {
    const url = `${this.base}/pools/${pool.name}/votes`
    const body = JSON.stringify({
      vote: upvote,
      submitter: user.id
    })
    const result = this.httpReq({ url, body, method: 'POST' })
    return result
  }

  // async -----------------------------------------------------------

  async httpReq (request, onSuccess) {
    return xhr(request, onSuccess)
  }

  async toNodeOsuBeatmap (map) {
    const mapped = Object.setPrototypeOf(this.mapping(map), nodeOsu.Beatmap.prototype)
    if (this.autoComplete) {
      if (this.validateMap(mapped).complete === false) return Object.assign(mapped, await this.apiGetMap(mapped))
      else return mapped
    } else {
      return mapped
    }
  }

  async toNodeOsuBeatmapList (list) {
    return Promise.all(list.map(async sel => {
      await this.toNodeOsuBeatmap(sel)
    }))
  }

  // api pools
  /*
      pool = {
          name: string,
          submitter: int,
          oldName: string //for PUTS /pools/{old_mappool_name}
          status: string //for PUTS /pools/{old_mappool_name}
      }
      */
  async getPools () {
    return fetch(`${this.base}/pools/`).then(res => res.json()).then(res => res.map(pool => new Pool(pool, this)))
  }

  async getPool ({ name }) {
    return fetch(`${this.base}/pools/${name}`).then(res => res.json()).then(res => {
      if (!res) throw new Error('未找到此地图，或api暂时无法访问')
      return new Pool(res, this)
    })
  }

  async deletePoolByPoolName ({ name, submitter }) {
    const url = `${this.base}/pools/${name}`
    const params = {
      submitter
    }
    const result = this.httpReq({ url, params, method: 'DELETE' })
    return result
  }

  // async deletePoolByPoolId ({ id, submitter }) {
  //     const url = `${this.base}/pools/`;
  //     const body = JSON.stringify({
  //         id,
  //         submitter,
  //     });
  //     const result = this.httpReq({ url, body, method: "DELETE" });
  //     return result;
  // }

  async createPool ({ name, submitter, creator }) {
    const url = `${this.base}/pools/${name}`
    const body = JSON.stringify({
      submitter,
      creator
    })
    const result = await this.httpReq({ url, body, method: 'POST' })
    return new Pool(result, this)
  }

  async editPoolByPoolName ({ oldName, name, status, submitter }) {
    const url = `${this.base}/pools/${oldName}`
    const body = JSON.stringify({
      mappool_name: name,
      status,
      submitter
    })
    const result = this.httpReq({ url, body, method: 'PUT' })
    return result
  }

  // api pools/maps
  /*
      pool 同上

      maps = [Maps];
      map = {
          id: int,
          mod: [string],
          index: int,
          stage: string,
          selector: int,
          submitter: int,
      }
      */

  async getMapsInPool (pool) {
    const url = `${this.base}/pools/${pool.name}/maps`
    // const params = { id: id };
    const result = await this.httpReq({ url })
    // return result
    return result.map(map => new EloMap(map, pool, this))
  }

  async getMapInPool ({ id }, pool) {
    const url = `${this.base}/pools/${pool.name}/maps/${id}`
    const result = this.httpReq({ url })
    return result
  }
  async uploadMapsIntoPool (maps, pool) {
    const list = new MapList(maps, pool, this)
    return this.uploadMapListIntoPool(list, pool)
  }

  async uploadMapListIntoPool (mapList, pool) {
    const validateResult = this.validateMaps(mapList.maps)
    const allMapsValidated = validateResult.every(result => result.required)
    if (!allMapsValidated) {
      return {
        error: 'invalid map in maps.',
        validateResult: mapList.maps.map((map, index) => Object.assign(map, validateResult[index].required))
      }
    }

    const url = `${this.base}/pools/${pool.name}/maps`
    const struct = {
      maps: mapList.toApiStruct(),
      submitter: pool.submitter
    }
    const body = JSON.stringify(struct)
    const result = this.httpReq({ url, body, method: 'POST' })
    return result
  }

  async deleteMapFromPool (map, pool) {
    const url = `${this.base}/pools/${pool.name}/maps/${map.id}`
    const params = {
      submitter: pool.submitter
    }
    const result = this.httpReq({ url, params, method: 'DELETE' })
    return result
  }
}
