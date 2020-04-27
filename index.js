// export modules
// ['User', 'MapPool', 'Pool', 'EloMap', 'MapList'].forEach(N => {
//   exports[N] = require(`./classes/${N}`)[N]
// })
import { User } from './classes/User'
import { MapPool } from './classes/MapPool'
import { Pool } from './classes/Pool'
import { EloMap } from './classes/EloMap'
import { MapList } from './classes/MapList'

module.export = {
	User,
	MapPool,
	Pool,
	EloMap,
	MapList,
}
