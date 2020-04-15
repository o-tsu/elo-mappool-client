# elo-mappool-client

```bash
npm install
browserify -r ./eloUploadTool.js:elo-mappool-api > test.js
```
```html
<script src= './test.js'></script>
<script>
  const {MapPool, Map, MapList, Pool} = require('elo-mappool-api');
</script>
```
## Pool:
```javascript
//new Pool
//apiResult parsed JSON from elo
//api instance of MapPool
//returns Pool
Pool.constructor(apiResult,api)

//get maps in pool
//returns Maplist
Pool.getMaps()

//delete pool
//returns Object result
Pool.delete()

//update pool
//change the property of the Pool instance then call this to update the pool on elo server
//let p = new Pool(...);
//p.name = 'new name';
//p.update();
//returns Object result
Pool.update()
```
try not to use listed below:
```javascript
//mapping elo JSON result to Pool object
//apiResult parsed JSON from elo
//returns undefined(void)
Pool.mapping(apiResult)
```

## Map:
```javascript
//new Map instance
//apiResult parsed JSON from elo
//pool Pool
//api MapPool instance
//returns Map
Map.constructor(apiResult, pool, api)

//update map in pool
//delete the map then re-add it
//returns undefined
Map.update()

//delete map from pool
//delete the map.
//returns Objecct result
Map.delete()
```
try not to use listed below
```javascript
Map.toApiStruct()
Map.mapping()
```
## MapList
```javascript
// new MapList instance
//maps [Maps]
//pool Pool
//api MapPool instance
MapList.constructor(maps, pool, api)

//add a map to Maplist ( won't upload until Maplist.upload() called)
//map Map
//returns 1 | error
MapList.addMap(map)

//return disjoint sets between this and maplist
//maplist Another MapList instance
//returns MapList
MapList.diff(maplist)

//upload maps
//return Object result
MapList.upload()

//delete all maps in the list
//return [Object result]
Maplist.deleteAll()

//deep copy of the list
//returns Maplist
Maplist.duplicate()
```
try not to use listed below
```javascript
MapList.toApiStruct()
```

## MapPool:
```javascript
//Get pools from elo
//returns [MapPool]
MapPool.getPools()

//Get pool from elo using name
//pool {name: string}
//returns MapPool
MapPool.getPool(pool)

//delete pool from elo using name
//pool MapPool
//returns Object result
MapPool.deletePoolByPoolName(pool)

//Create pool
//pool {name: string, submitter: int, creator: int}
//returns MapPool
MapPool.createPool(pool)

//Edit Pool
//pool.name new name if willing to change it.
//pool.oldName need be different to new Name if you are willing to change the name
//pool.status string,
//pool.submitter int
//returns 
MapPool.editPoolByName(pool)

//get all maps in pool
//pool {name: string}
//returns [Map]
MapPool.getMapsInPool(pool)

//get map in pool using pool_name and map_id
//map {id: int | string}
//pool {name: string}
returns Map | null
MapPool.getMapInPool(map,pool)

//upload all maps in the maplist to pool
//maplist MapList
//pool Pool
//returns [Object result]
MapPool.uploadMapListIntoPool(mapList, pool)
//upload maps to pool
//list [Map]
//pool Pool
//returns [Result]
MapPool.uploadMapsIntoPool(list,pool)

//delete maps fron pool
//map Map {id: int | string}
//pool Pool
MapPool.deleteMapFromPool(map,pool)

```
Try not use functions below.
```javascript
MapPool.apiGetMap(map) // map: {id: beatmap_id}
MapPool.mapping(map)
MapPool.toNodeOsuBeatmap(map)
MapPool.toNodeOsuBeatmapList(list) // [map]
MapPool.validateMap(map)
MapPool.validateMaps(list) // [map]
MapPool.httpReq(req,onSuccess) //{url, method, params, body},Function
```
