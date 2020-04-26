const param = require('jquery-param')
// const osu = node_osu.Api
const fetch = require('node-fetch')

module.exports = ({ url, method = 'GET', params = {}, body = undefined }, onSuccess = res => res.json()) => {
  // url.search = new URLSearchParams(params).toString();
  if (params !== {}) url += `?${param(params)}`
  return fetch(url, {
    method,
    body
  }).then(onSuccess)
}
