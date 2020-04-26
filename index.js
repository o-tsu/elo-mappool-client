// export modules
['User', 'MapPool', 'Pool', 'EloMap', 'MapList'].forEach(N => {
  exports[N] = require(`./classes/${N}`)[N]
})
