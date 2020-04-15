const node_osu = require('node-osu');
// const { URL, URLSearchParams } = require('url');
const param = require('jquery-param');
// const osu = node_osu.Api
const fetch = require('node-fetch');


function MapPool({
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
        length: { total: -1, drain: -1 },
    }
} = {}) {
    this.base = apiBase;
    this.autoComplete = autoComplete;
    this.sample = sample;
}
MapPool.prototype.apiGetMap = function(mapped) {
    // console.log(mapped);
    return fetch(`http://47.101.168.165:5005/api/map/${mapped.id}`).then(res => res.json()).then(res => res[0]).then(res => new node_osu.Beatmap({ parseNumeric: true }, res));
    // return this.bancho.getBeatmaps({ b: mapped.id }).then(result => result[0]).catch(e => Promise.resolve(mapped));
}
MapPool.prototype.mapping = function(map) {
    return JSON.parse(JSON.stringify(Object.assign(this.sample, {
        id: map.map_id || null,
        title: map.map_title || undefined,
        creator: map.map_creator || undefined,
        artist: map.map_artist || undefined,
        version: map.map_version || undefined,
        difficulty: Object.assign(this.sample.difficulty, {
            rating: map.difficulty_rating || undefined,
        }),
        mod: map.mod || [],
        stage: map.stage || null,
        index: map.mod_index || null,
        selector: map.selector || undefined,
        selector: map.submitter || null,
    })));
}

MapPool.prototype.toNodeOsuBeatmap = async function(map) {
    const mapped = this.mapping(map);
    mapped.__proto__ = node_osu.Beatmap.prototype;
    if (this.autoComplete) {
        if (this.validateMap(mapped).complete == false) return Object.assign(mapped, await this.apiGetMap(mapped));
        else return mapped;
    } else {
        // mapped.__proto__ = node_osu.Beatmap.prototype;
        return mapped;
    }
}

MapPool.prototype.toNodeOsuBeatmapList = async function(list) {
    return Promise.all(list.map(async sel => await this.toNodeOsuBeatmap(sel)));
}

MapPool.prototype.validateMap = function(mapped) {
    const result = {
        required: false,
        completed: false,
    };
    if (Object.entries(mapped).some(([prop, value]) => value == null)) return result;
    else if (mapped.mod.length <= 0) return result;
    result.required = true;
    if (Object.entries(mapped).some(([prop, value]) => value == undefined)) return result;
    if (['null', 'undefined'].includes(typeof mapped.difficulty) || ['null', 'undefined'].includes(typeof mapped.length)) return result;
    else if ([mapped.difficulty, mapped.length].some((sub) => Object.entries(sub).map(([prop, value]) => value == undefined || value < 0))) return result;
    result.completed = true;
    return result;
}

MapPool.prototype.validateMaps = function(list) {
    return list.map((map) => this.validateMap(map));
}



//api 

MapPool.prototype.httpReq = async function({ url, method = 'GET', params = {}, body = undefined }, onSuccess = res => res.json()) {
    // url.search = new URLSearchParams(params).toString();
    if (params != {}) url += `?${param(params)}`;
    return fetch(url, {
        method,
        body,
    }).then(onSuccess);
}

//api pools 
/*
pool = {
    name: string,
    submitter: int,
    oldName: string //for PUTS /pools/{old_mappool_name}
    status: string //for PUTS /pools/{old_mappool_name}
}
*/
MapPool.prototype.getPools = async function() {
    return fetch(`${this.base}/pools/`).then(res => res.json()).then(res => res.map(pool => new Pool(pool, this)))
}
MapPool.prototype.getPool = async function({ name }) {
    return fetch(`${this.base}/pools/${name}`).then(res => res.json()).then(res => new Pool(res, this));
}

MapPool.prototype.deletePoolByPoolName = async function({ name, submitter }) {
    const url = `${this.base}/pools/${name}`;
    const params = {
        submitter,
    };
    const result = this.httpReq({ url, params, method: "DELETE" });
    return result;
}
// MapPool.prototype.deletePoolByPoolId = async function({ id, submitter }) {
//     const url = `${this.base}/pools/`;
//     const body = JSON.stringify({
//         id,
//         submitter,
//     });
//     const result = this.httpReq({ url, body, method: "DELETE" });
//     return result;
// }

MapPool.prototype.createPool = async function({ name, submitter, creator }) {
    const url = `${this.base}/pools/${name}`;
    const body = JSON.stringify({
        submitter,
        creator,
    });
    const result = await this.httpReq({ url, body, method: "POST" });
    return new Pool(result,this);
}

MapPool.prototype.editPoolByPoolName = async function({ oldName, name, status, submitter }) {
    const url = `${this.base}/pools/${oldName}`;
    const body = JSON.stringify({
        mappool_name: name,
        status,
        submitter,
    });
    const result = this.httpReq({ url, body, method: "PUT" });
    return result;
}

//api pools/maps
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
MapPool.prototype.getMapsInPool = async function(pool) {
    const url = `${this.base}/pools/${pool.name}/maps`;
    // const params = { map_id: id };
    const result = await this.httpReq({ url });
    return result;
    return result.map(map => new map(map, pool, this));
}

MapPool.prototype.getMapInPool = async function({ id }, pool) {
    const url = `${this.base}/pools/${pool.name}/maps/${id}`;
    const result = this.httpReq({ url });
    return result;

}
MapPool.prototype.uploadMapsIntoPool = async function(maps, pool) {
    const list = new MapList(maps, pool, this);
    return this.uploadMapListIntoPool(list, pool);
}
MapPool.prototype.uploadMapListIntoPool = async function(mapList, pool) {
    const validateResult = this.validateMaps(mapList.maps);
    const allMapsValidated = validateResult.every(result => result.required);
    if (!allMapsValidated) {
        throw {
            error: 'invalid map in maps.',
            validateResult: mapList.maps.map((map, index) => Object.assign(map, validateResult[index].required)),
        }
    }


    const url = `${this.base}/pools/${pool.name}/maps`;
    const struct = {
        maps: maps.toApiStruct(),
        submitter: pool.submitter,
    }
    const body = JSON.stringify(struct);
    const result = this.httpReq({ url, body, method: "POST" });
    return result;
}

MapPool.prototype.deleteMapFromPool = async function(map, pool) {
    const url = `${this.base}/pools/${pool.name}/maps/${map.id}`;
    const params = {
        submitter: pool.submitter,
    };
    const result = this.httpReq({ url, params, method: "DELETE" });
    return result;
}

//pool
function Pool(apiResult, api) {
    try {
        this.mapping(apiResult);
        this.api = api;
    } catch (error) {
        throw error;
    }
}
Pool.prototype.mapping = function(apiResult) {
    this.id = apiResult.id;
    this.name = apiResult.mappool_name;
    this.submitter = apiResult.submitter;
    this.oldName = this.name;
    this.status = apiResult.status;
}
Pool.prototype.getMaps = async function() {
    this.maps = new MapList(await this.api.getMapsInPool(this), this, this.api);
    const copy = this.maps.duplicate();
    return copy;
}
Pool.prototype.delete = async function() {
    // if (this.id > 0) return this.api.deletePoolByPoolId(this);
    //else 
    if (this.name) return this.api.deletePoolByPoolName(this);
    else throw new Error('invalid pool.')
}
Pool.prototype.update = async function() {
    return this.api.editPoolByPoolName(this).then(result => {
        if (result) this.mapping(result);
        else throw new Error('update failed');
    });
}

//map
function Map(apiResult, pool, api) {
    try {
        this.mapping(apiResult);
        this.pool = pool;
        this.api = api;
    } catch (error) {
        throw error;
    }
}

Map.prototype.toApiStruct = function() {
    return {
        map_id: this.id,
        mod: this.mod,
        mod_index: this.index,
        stage: this.stage,
        selector: this.selector,
    }
}

Map.prototype.mapping = function(apiResult) {
    this.id = apiResult.map_id;
    this.mod = apiResult.mod;
    this.index = apiResult.mod_index;
    this.stage = apiResult.stage;
    this.selector = apiResult.selector;
}

Map.prototype.update = function() {
    try {
        this.api.deleteMapFromPool(this, this.pool);
        return this.api.uploadMapsIntoPool([this], this.pool);
    } catch (error) {
        throw error;
    }
}

Map.prototype.delete = async function() {
    return this.api.deleteMapFromPool(this, this.pool)
}

function MapList(maps, pool, api) {
    this.maps = maps;
    this.pool = pool;
    this.api = api;
}
MapList.prototype.toApiStruct = function() {
    return this.maps.map(map => map.toApiStruct());
}
MapList.prototype.addMap = function(map) {
    if (map instanceof Map) {
        return this.maps.push(map);
    } else {
        try {
            return this.maps.push(new Map(map, this.pool, this, api));
        } catch (error) {
            throw new Error('not a Map instance')
        }
    }
}
MapList.prototype.diff = function(newMapList) {
    notInBoth = newMapList.maps.filter(map => !this.maps.includes(map)).concat(this.maps.filter(map => !newMapList.maps.includes(map)));
    return new MapList(notInBoth, this.pool, this.api);
}
MapList.prototype.upload = function() {
    return this.api.uploadMapListIntoPool(this, this.pool);
}
MapList.prototype.deleteAll = function() {
    const result = this.maps.map(map => map.delete());
    this.maps = [];
    return result;
}
MapList.prototype.duplicate = function() {
    const copy = JSON.parse(JSON.stringify(this.maps));
    copy.map(map => {
        map.__proto__ = Map.prototype;
        map.pool = this.pool;
        map.api = this.api;
    });

    return new MapList(copy, this.pool, this.api);
}

exports.MapPool = MapPool;
exports.Pool = Pool;
exports.Map = Map;
exports.MapList = MapList;