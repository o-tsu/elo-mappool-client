require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const param = require('jquery-param');
// const osu = node_osu.Api
const fetch = require('node-fetch');

module.exports = ({ url, method = 'GET', params = {}, body = undefined }, onSuccess = res => res.json()) => {
    // url.search = new URLSearchParams(params).toString();
    if (params != {}) url += `?${param(params)}`;
    return fetch(url, {
        method,
        body,
    }).then(onSuccess);
}
},{"jquery-param":4,"node-fetch":5}],2:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
  }

  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};

  var args = new Array(arguments.length - 1)
    , callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],3:[function(require,module,exports){
module.exports = stringify
stringify.default = stringify
stringify.stable = deterministicStringify
stringify.stableStringify = deterministicStringify

var arr = []
var replacerStack = []

// Regular stringify
function stringify (obj, replacer, spacer) {
  decirc(obj, '', [], undefined)
  var res
  if (replacerStack.length === 0) {
    res = JSON.stringify(obj, replacer, spacer)
  } else {
    res = JSON.stringify(obj, replaceGetterValues(replacer), spacer)
  }
  while (arr.length !== 0) {
    var part = arr.pop()
    if (part.length === 4) {
      Object.defineProperty(part[0], part[1], part[3])
    } else {
      part[0][part[1]] = part[2]
    }
  }
  return res
}
function decirc (val, k, stack, parent) {
  var i
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k)
        if (propertyDescriptor.get !== undefined) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: '[Circular]' })
            arr.push([parent, k, val, propertyDescriptor])
          } else {
            replacerStack.push([val, k])
          }
        } else {
          parent[k] = '[Circular]'
          arr.push([parent, k, val])
        }
        return
      }
    }
    stack.push(val)
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        decirc(val[i], i, stack, val)
      }
    } else {
      var keys = Object.keys(val)
      for (i = 0; i < keys.length; i++) {
        var key = keys[i]
        decirc(val[key], key, stack, val)
      }
    }
    stack.pop()
  }
}

// Stable-stringify
function compareFunction (a, b) {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}

function deterministicStringify (obj, replacer, spacer) {
  var tmp = deterministicDecirc(obj, '', [], undefined) || obj
  var res
  if (replacerStack.length === 0) {
    res = JSON.stringify(tmp, replacer, spacer)
  } else {
    res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer)
  }
  while (arr.length !== 0) {
    var part = arr.pop()
    if (part.length === 4) {
      Object.defineProperty(part[0], part[1], part[3])
    } else {
      part[0][part[1]] = part[2]
    }
  }
  return res
}

function deterministicDecirc (val, k, stack, parent) {
  var i
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k)
        if (propertyDescriptor.get !== undefined) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: '[Circular]' })
            arr.push([parent, k, val, propertyDescriptor])
          } else {
            replacerStack.push([val, k])
          }
        } else {
          parent[k] = '[Circular]'
          arr.push([parent, k, val])
        }
        return
      }
    }
    if (typeof val.toJSON === 'function') {
      return
    }
    stack.push(val)
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        deterministicDecirc(val[i], i, stack, val)
      }
    } else {
      // Create a temporary object in the required way
      var tmp = {}
      var keys = Object.keys(val).sort(compareFunction)
      for (i = 0; i < keys.length; i++) {
        var key = keys[i]
        deterministicDecirc(val[key], key, stack, val)
        tmp[key] = val[key]
      }
      if (parent !== undefined) {
        arr.push([parent, k, val])
        parent[k] = tmp
      } else {
        return tmp
      }
    }
    stack.pop()
  }
}

// wraps replacer function to handle values we couldn't replace
// and mark them as [Circular]
function replaceGetterValues (replacer) {
  replacer = replacer !== undefined ? replacer : function (k, v) { return v }
  return function (key, val) {
    if (replacerStack.length > 0) {
      for (var i = 0; i < replacerStack.length; i++) {
        var part = replacerStack[i]
        if (part[1] === key && part[0] === val) {
          val = '[Circular]'
          replacerStack.splice(i, 1)
          break
        }
      }
    }
    return replacer.call(this, key, val)
  }
}

},{}],4:[function(require,module,exports){
/**
 * @preserve jquery-param (c) 2015 KNOWLEDGECODE | MIT
 */
(function (global) {
    'use strict';

    var param = function (a) {
        var s = [];
        var add = function (k, v) {
            v = typeof v === 'function' ? v() : v;
            v = v === null ? '' : v === undefined ? '' : v;
            s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
        };
        var buildParams = function (prefix, obj) {
            var i, len, key;

            if (prefix) {
                if (Array.isArray(obj)) {
                    for (i = 0, len = obj.length; i < len; i++) {
                        buildParams(
                            prefix + '[' + (typeof obj[i] === 'object' && obj[i] ? i : '') + ']',
                            obj[i]
                        );
                    }
                } else if (String(obj) === '[object Object]') {
                    for (key in obj) {
                        buildParams(prefix + '[' + key + ']', obj[key]);
                    }
                } else {
                    add(prefix, obj);
                }
            } else if (Array.isArray(obj)) {
                for (i = 0, len = obj.length; i < len; i++) {
                    add(obj[i].name, obj[i].value);
                }
            } else {
                for (key in obj) {
                    buildParams(key, obj[key]);
                }
            }
            return s;
        };

        return buildParams('', a).join('&');
    };

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = param;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return param;
        });
    } else {
        global.param = param;
    }

}(this));

},{}],5:[function(require,module,exports){
(function (global){
"use strict";

// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
exports.default = global.fetch.bind(global);

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
module.exports = {
	Api: require('./lib/Api.js'),
	Constants: require('./lib/Constants.js'),
	Beatmap: require('./lib/base/Beatmap.js'),
	Score: require('./lib/base/Score.js'),
	User: require('./lib/base/User.js'),
	Match: require('./lib/base/Match.js'),
	Game: require('./lib/base/Game.js'),
	MultiplayerScore: require('./lib/base/MultiplayerScore.js'),
	Event: require('./lib/base/Event.js')
};

},{"./lib/Api.js":7,"./lib/Constants.js":8,"./lib/base/Beatmap.js":9,"./lib/base/Event.js":10,"./lib/base/Game.js":11,"./lib/base/Match.js":12,"./lib/base/MultiplayerScore.js":13,"./lib/base/Score.js":14,"./lib/base/User.js":15}],7:[function(require,module,exports){
const request = require('superagent');
const userAgent = `node-osu v${require('../package.json').version} (https://github.com/brussell98/node-osu)`;
const Beatmap = require('./base/Beatmap.js');
const Score = require('./base/Score.js');
const Match = require('./base/Match.js');
const User = require('./base/User.js');

class Api {
	/**
	 * Creates a new node-osu object
	 * @param {String} apiKey your osu api key
	 * @param {Object} [options]
	 * @param {String} [options.baseUrl="https://osu.ppy.sh/api"] Sets the base api url
	 * @param {Boolean} [options.notFoundAsError=true] Throw an error on not found instead of returning nothing
	 * @param {Boolean} [options.completeScores=false] When fetching scores also fetch the beatmap they are for (Allows getting accuracy)
	 * @param {Boolean} [options.parseNumeric=false] Parse numeric properties into numbers. May have overflow
	 */
	constructor(apiKey, options = { }) {
		this.apiKey = apiKey;
		this.baseUrl = options.baseUrl || 'https://osu.ppy.sh/api';
		this.notFoundAsError = options.notFoundAsError === undefined ? true : !!options.notFoundAsError;
		this.completeScores = !!options.completeScores;
		this.parseNumeric = !!options.parseNumeric;
	}

	get config() {
		return {
			notFoundAsError: this.notFoundAsError,
			completeScores: this.completeScores,
			parseNumeric: this.parseNumeric
		};
	}

	/**
	 * Makes an api call
	 * @param {String} endpoint
	 * @param {Object} options
	 * @param {Date} [options.since] Return all beatmaps ranked or loved since this date
	 * @param {String} [options.s] Specify a beatmapSetId to return metadata from
	 * @param {String} [options.b] Specify a beatmapId to return metadata from
	 * @param {String} [options.u] Specify a userId or a username to return metadata from
	 * @param {"string"|"id"} [options.type] Specify if `u` is a userId or a username
	 * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
	 * @param {0|1} [options.a] Specify whether converted beatmaps are included
	 * @param {String} [options.h] The beatmap hash
	 * @param {Number} [options.limit] Amount of results. Default and maximum are 500
	 * @param {Number} [options.mods] Mods that apply to the beatmap requested. Default is 0
	 * @param {Number} [options.event_days] Max number of days between now and last event date. Range of 1-31. Default value is 1
	 * @param {String} [options.mp] Match id to get information from
	 * @returns {Promise<Object>} The response body
	 */
	async apiCall(endpoint, options) {
		if (!this.apiKey)
			throw new Error('apiKey not set');
		options.k = this.apiKey;

		try {
			const resp = await request.get(this.baseUrl + endpoint)
				.set('User-Agent', userAgent)
				.query(options);

			return resp.body;
		} catch (error) {
			throw new Error(error.response || error);
		}
	}

	/**
	 * Returns a not found error or the response, depending on the config
	 * @param {Object} response
	 * @returns {Object}
	 */
	notFound(response) {
		if (this.notFoundAsError)
			throw new Error('Not found');

		return response;
	}

	/**
	 * Returns an array of Beatmap objects
	 * @param {Object} options
	 * @param {String} options.b Specify a beatmapId to return metadata from
	 * @param {Date} [options.since] Return all beatmaps ranked or loved since this date
	 * @param {String} [options.s] Specify a beatmapSetId to return metadata from
	 * @param {String} [options.u] Specify a userId or a username to return metadata from
	 * @param {"string"|"id"} [options.type] Specify if `u` is a userId or a username
	 * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
	 * @param {0|1} [options.a] Specify whether converted beatmaps are included
	 * @param {String} [options.h] The beatmap hash
	 * @param {Number} [options.limit] Amount of results. Default and maximum are 500
	 * @param {Number} [options.mods] Mods that apply to the beatmap requested. Default is 0
	 * @returns {Promise<Beatmap[]>}
	 */
	async getBeatmaps(options) {
		const resp = await this.apiCall('/get_beatmaps', options);

		if (resp.length === 0)
			return this.notFound(resp);

		return resp.map(bm => new Beatmap(this.config, bm));
	}

	/**
	 * Returns a User object
	 * @param {Object} options
	 * @param {String} options.u Specify a userId or a username to return metadata from
	 * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
	 * @param {"string"|"id"} [options.type] Specify if u is a user_id or a username
	 * @param {Number} [options.event_days] Max number of days between now and last event date. Range of 1-31. Default value is 1
	 * @returns {Promise<User>}
	 */
	async getUser(options) {
		const resp = await this.apiCall('/get_user', options);

		if (resp.length === 0)
			return this.notFound(resp);

		return new User(this.config, resp[0]);
	}

	/**
	 * Returns an array of Score objects
	 * @param {Object} options
	 * @param {String} options.b Specify a beatmapId to return score information from
	 * @param {String} [options.u] Specify a userId or a username to return information for
	 * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
	 * @param {"string"|"id"} [options.type] Specify if u is a user_id or a username
	 * @param {Number} [options.limit] Amount of results from the top (range between 1 and 100 - defaults to 50)
	 * @returns {Promise<Score[]>}
	 */
	async getScores(options) {
		const resp = await this.apiCall('/get_scores', options);

		if (resp.length === 0)
			return this.notFound(resp);

		if (!this.completeScores)
			return resp.map(sc => new Score(this.config, sc));

		const beatmaps = await this.getBeatmaps({ b: options.b });
		return resp.map(sc => new Score(this.config, sc, beatmaps[0]));
	}

	/**
	 * Returns an array of Score objects
	 * @param {Object} options
	 * @param {String} options.u Specify a userId or a username to return best scores from
	 * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
	 * @param {"string"|"id"} [options.type] Specify if u is a user_id or a username
	 * @param {Number} [options.limit] Amount of results (range between 1 and 100 - defaults to 10)
	 * @returns {Promise<Score[]>}
	 */
	async getUserBest(options) {
		const resp = await this.apiCall('/get_user_best', options);

		if (resp.length === 0)
			return this.notFound(resp);

		if (!this.completeScores)
			return resp.map(sc => new Score(this.config, sc));

		const scores = resp.map(sc => new Score(this.config, sc));
		for (const score of scores)
			score.beatmap = (await this.getBeatmaps({ b: score.beatmapId }))[0];

		return scores;
	}

	/**
	 * Returns an array of Score objects.
	 * Will return not found if the user has not submitted any scores in the past 24 hours
	 * @param {Object} options
	 * @param {String} options.u Specify a userId or a username to return recent plays from
	 * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
	 * @param {"string"|"id"} [options.type] Specify if `u` is a user_id or a username
	 * @param {Number} [options.limit] Amount of results (range between 1 and 50 - defaults to 10)
	 * @returns {Promise<Score[]>}
	 */
	async getUserRecent(options) {
		const resp = await this.apiCall('/get_user_recent', options);

		if (resp.length === 0)
			return this.notFound(resp);

		if (!this.completeScores)
			return resp.map(sc => new Score(this.config, sc));

		const scores = resp.map(sc => new Score(this.config, sc));
		for (const score of scores)
			score.beatmap = (await this.getBeatmaps({ b: score.beatmapId }))[0];

		return scores;
	}

	/**
	 * Returns a Match object.
	 * @param {Object} options
	 * @param {String} options.mp Match id to get information from
	 * @returns {Promise<Match>}
	 */
	async getMatch(options) {
		const resp = await this.apiCall('/get_match', options);

		if (resp.match === 0)
			return this.notFound(resp);

		return new Match(this.config, resp);
	}

	/**
	 * Returns a replay object. **Do not spam this endpoint.**
	 * @param {Object} options
	 * @param {0|1|2|3} options.m Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
	 * @param {String} options.b The beatmapId in which the replay was played
	 * @param {String} options.u The user that has played the beatmap (required)
	 * @param {"string"|"id"} [options.type] Specify if u is a userId or a username
	 * @param {Number} [options.mods] Specify a mod or mod combination
	 *
	 */
	async getReplay(options) {
		return await this.apiCall('/get_replay', options);
	}
}

module.exports = Api;

},{"../package.json":17,"./base/Beatmap.js":9,"./base/Match.js":12,"./base/Score.js":14,"./base/User.js":15,"superagent":19}],8:[function(require,module,exports){
module.exports = {
	/**
	 * An enum of mods with their bitwise representation
	 * @readonly
	 * @enum {Number}
	 */
	Mods: {
		'None'          : 0,
		'NoFail'        : 1,
		'Easy'          : 1 << 1,
		'TouchDevice'   : 1 << 2,
		'Hidden'        : 1 << 3,
		'HardRock'      : 1 << 4,
		'SuddenDeath'   : 1 << 5,
		'DoubleTime'    : 1 << 6,
		'Relax'         : 1 << 7,
		'HalfTime'      : 1 << 8,
		'Nightcore'     : 1 << 9, // DoubleTime mod
		'Flashlight'    : 1 << 10,
		'Autoplay'      : 1 << 11,
		'SpunOut'       : 1 << 12,
		'Relax2'        : 1 << 13, // Autopilot
		'Perfect'       : 1 << 14, // SuddenDeath mod
		'Key4'          : 1 << 15,
		'Key5'          : 1 << 16,
		'Key6'          : 1 << 17,
		'Key7'          : 1 << 18,
		'Key8'          : 1 << 19,
		'FadeIn'        : 1 << 20,
		'Random'        : 1 << 21,
		'Cinema'        : 1 << 22,
		'Target'        : 1 << 23,
		'Key9'          : 1 << 24,
		'KeyCoop'       : 1 << 25,
		'Key1'          : 1 << 26,
		'Key3'          : 1 << 27,
		'Key2'          : 1 << 28,
		'KeyMod'        : 521109504,
		'FreeModAllowed': 522171579,
		'ScoreIncreaseMods': 1049662
	},
	/** An object containing functions to generate osu protocol URLs */
	URLSchemas: {
		/** Joins a multiplayer match */
		multiplayerMatch: (id, password) => `osu://mp/${id}${password !== undefined ? '/' + password : ''}`,
		/** Links to a certain part of a map in the editor */
		edit: (position, objects) => `osu://edit/${position}${objects !== undefined ? ' ' + objects : ''}`,
		/** Joins a chat channel */
		channel: name => `osu://chan/#${name}`,
		/** Downloads a beatmap in the game */
		download: id => `osu://dl/${id}`,
		/** Spectates a player */
		spectate: user => `osu://spectate/${user}`
	},
	/** Enums for beatmaps */
	Beatmaps: {
		/**
		 * Approval states
		 * @readonly
		 * @enum {String}
		 */
		approved: {
			'-2': 'Graveyard',
			'-1': 'WIP',
			'0': 'Pending',
			'1': 'Ranked',
			'2': 'Approved',
			'3': 'Qualified',
			'4': 'Loved'
		},
		/**
		 * Song genres
		 * @readonly
		 * @enum {String}
		 */
		genre: {
			'0': 'Any',
			'1': 'Unspecified',
			'2': 'Video Game',
			'3': 'Anime',
			'4': 'Rock',
			'5': 'Pop',
			'6': 'Other',
			'7': 'Novelty',
			'9': 'Hip Hop',
			'10': 'Electronic'
		},
		/**
		 * Song languages
		 * @readonly
		 * @enum {String}
		 */
		language: {
			'0': 'Any',
			'1': 'Other',
			'2': 'English',
			'3': 'Japanese',
			'4': 'Chinese',
			'5': 'Instrumental',
			'6': 'Korean',
			'7': 'French',
			'8': 'German',
			'9': 'Swedish',
			'10': 'Spanish',
			'11': 'Italian'
		},
		/**
		 * Game modes
		 * @readonly
		 * @enum {String}
		 */
		mode: {
			'0': 'Standard',
			'1': 'Taiko',
			'2': 'Catch the Beat',
			'3': 'Mania'
		}
	},
	/** Enums for multiplayer matches */
	Multiplayer: {
		/**
		 * Scoring types
		 * @readonly
		 * @enum {String}
		 */
		scoringType: {
			'0': 'Score',
			'1': 'Accuracy',
			'2': 'Combo',
			'3': 'Score v2'
		},
		/**
		 * Team setup
		 * @readonly
		 * @enum {String}
		 */
		teamType: {
			'0': 'Head to Head',
			'1': 'Tag Co-op',
			'2': 'Team vs',
			'3': 'Tag Team vs'
		},
		/**
		 * Team of a player
		 * @readonly
		 * @enum {String}
		 */
		team: {
			'0': 'None',
			'1': 'Blue',
			'2': 'Red'
		}
	},
	/** Methods to calculate accuracy based on the game mode */
	AccuracyMethods: {
		/**
		 * Calculates accuracy based on hit counts for standard games
		 * @param {Object} c Hit counts
		 */
		Standard: c => {
			const total = c['50'] + c['100'] + c['300'] + c.miss;
			return total === 0 ? 0 : ((c['300'] * 300 + c['100'] * 100 + c['50'] * 50) / (total * 300));
		},
		/**
		 * Calculates accuracy based on hit counts for taiko games
		 * @param {Object} c Hit counts
		 */
		Taiko: c => {
			const total = c['100'] + c['300'] + c.miss;
			return total === 0 ? 0 : (((c['300'] + c['100'] * .5) * 300) / (total * 300));
		},
		/**
		 * Calculates accuracy based on hit counts for CtB games
		 * @param {Object} c Hit counts
		 */
		'Catch the Beat': c => {
			const total = c['50'] + c['100'] + c['300'] + c.katu + c.miss;
			return total === 0 ? 0 : ((c['50'] + c['100'] + c['300']) / total);
		},
		/**
		 * Calculates accuracy based on hit counts for mania games
		 * @param {Object} c Hit counts
		 */
		Mania: c => { // (count50 * 50 + count100 * 100 + countKatu * 200 + (count300 + countGeki) * 300) / (totalHits * 300)
			const total = c['50'] + c['100'] + c['300'] + c.katu + c.geki + c.miss;
			return total === 0 ? 0 : ((c['50'] * 50 + c['100'] * 100 + c.katu * 200 + (c['300'] + c.geki) * 300) / (total * 300));
		}
	}
};

},{}],9:[function(require,module,exports){
const { getNumeric } = require('../utils.js');
const Constants = require('../Constants.js');

/**
 * A beatmap
 * @prop {String} id
 * @prop {String} beatmapSetId
 * @prop {String} hash
 * @prop {String} title
 * @prop {String} creator
 * @prop {String} version
 * @prop {String} source
 * @prop {String} artist
 * @prop {String} genre
 * @prop {String} language
 * @prop {String|Number} rating
 * @prop {String|Number} bpm
 * @prop {String} mode
 * @prop {String[]} tags
 * @prop {String} approvalStatus
 * @prop {String} raw_submitDate
 * @prop {String} raw_approvedDate
 * @prop {String} raw_lastUpdate
 * @prop {String|Number} maxCombo
 * @prop {Object} objects
 * @prop {String|Number} objects.normal
 * @prop {String|Number} objects.slider
 * @prop {String|Number} objects.spinner
 * @prop {Object} difficulty
 * @prop {String|Number} difficulty.rating
 * @prop {String|Number} difficulty.aim
 * @prop {String|Number} difficulty.speed
 * @prop {String|Number} difficulty.size
 * @prop {String|Number} difficulty.overall
 * @prop {String|Number} difficulty.approach
 * @prop {String|Number} difficulty.drain
 * @prop {Object} length
 * @prop {String|Number} length.total
 * @prop {String|Number} length.drain
 * @prop {Object} counts
 * @prop {String|Number} counts.favorites
 * @prop {String|Number} counts.favourites
 * @prop {String|Number} counts.plays
 * @prop {String|Number} counts.passes
 * @prop {Boolean} hasDownload
 * @prop {Boolean} hasAudio
 * @prop {Date} submitDate
 * @prop {Date} approvedDate
 * @prop {Date} lastUpdate
 */
class Beatmap {
	constructor(config, data) {
		const num = getNumeric(config.parseNumeric);

		this.id = data.beatmap_id;
		this.beatmapSetId = data.beatmapset_id;
		this.hash = data.file_md5;
		this.title = data.title;
		this.creator = data.creator;
		this.version = data.version;

		this.source = data.source;
		this.artist = data.artist;
		this.genre = Constants.Beatmaps.genre[data.genre_id];
		this.language = Constants.Beatmaps.language[data.language_id];

		this.rating = num(data.rating);
		this.bpm = num(data.bpm);
		this.mode = Constants.Beatmaps.mode[data.mode];
		this.tags = data.tags.split(' ');
		this.approvalStatus = Constants.Beatmaps.approved[data.approved];
		this.raw_submitDate = data.submit_date;
		this.raw_approvedDate = data.approved_date;
		this.raw_lastUpdate = data.last_update;
		this.maxCombo = num(data.max_combo);
		this.objects = {
			normal: num(data.count_normal),
			slider: num(data.count_slider),
			spinner: num(data.count_spinner)
		};
		this.difficulty = {
			rating: num(data.difficultyrating),
			aim: num(data.diff_aim),
			speed: num(data.diff_speed),
			size: num(data.diff_size),
			overall: num(data.diff_overall),
			approach: num(data.diff_approach),
			drain: num(data.diff_drain)
		};
		this.length = {
			total: num(data.total_length),
			drain: num(data.hit_length)
		};
		this.counts = {
			favorites: num(data.favourite_count),
			favourites: num(data.favourite_count),
			plays: num(data.playcount),
			passes: num(data.passcount)
		};
		this.hasDownload = data.download_unavailable === '0';
		this.hasAudio = data.audio_unavailable === '0';
	}

	get submitDate() {
		if (this._submitDate !== undefined)
			return this._submitDate;

		this._submitDate = new Date(this.raw_submitDate + ' UTC');
		return this._submitDate;
	}

	get approvedDate() {
		if (this._approvedDate !== undefined)
			return this._approvedDate;

		this._approvedDate = this.raw_approvedDate ? new Date(this.raw_approvedDate + ' UTC') : null;
		return this._approvedDate;
	}

	get lastUpdate() {
		if (this._lastUpdate !== undefined)
			return this._lastUpdate;

		this._lastUpdate = new Date(this.raw_lastUpdate + ' UTC');
		return this._lastUpdate;
	}

}

module.exports = Beatmap;

},{"../Constants.js":8,"../utils.js":16}],10:[function(require,module,exports){
const { getNumeric } = require('../utils.js');

/**
 * A timeline event for a user
 * @prop {String} html
 * @prop {String} beatmapId
 * @prop {String} beatmapSetId
 * @prop {String} raw_date
 * @prop {String|Number} epicFactor How "epic" this event is (from 1-32)
 * @prop {Date} date
 */
class Event {
	constructor(config, data) {
		const num = getNumeric(config.parseNumeric);

		this.html = data.display_html;
		this.beatmapId = data.beatmap_id;
		this.beatmapsetId = data.beatmapset_id;
		this.raw_date = data.date;
		this.epicFactor = num(data.epicfactor);
	}

	get date() {
		if (this._date !== undefined)
			return this._date;

		this._date = new Date(this.raw_date + ' UTC');
		return this._date;
	}
}

module.exports = Event;

},{"../utils.js":16}],11:[function(require,module,exports){
const MultiplayerScore = require('./MultiplayerScore.js');
const Constants = require('../Constants.js');

/**
 * A multiplayer game
 * @prop {String} id
 * @prop {String} raw_start
 * @prop {String} raw_end
 * @prop {String} beatmapId
 * @prop {String} mode
 * @prop {"0"} matchType
 * @prop {String} scoringType
 * @prop {String} teamType
 * @prop {Number} raw_mods
 * @prop {MultiplayerScore[]} scores
 * @prop {Date} start
 * @prop {Date} end
 * @prop {String[]} mods
 */
class Game {
	constructor(config, data) {
		this.id = data.game_id;
		this.raw_start = data.start_time;
		this.raw_end = data.end_time;
		this.beatmapId = data.beatmap_id;
		this.mode = Constants.Beatmaps.mode[data.play_mode];
		this.matchType = data.match_type; // Unknown
		this.scoringType = Constants.Multiplayer.scoringType[data.scoring_type];
		this.teamType = Constants.Multiplayer.teamType[data.team_type];
		this.raw_mods = parseInt(data.mods);
		this.scores = data.scores.map(g => new MultiplayerScore(config, g));
	}

	get start() {
		if (this._start !== undefined)
			return this._start;

		this._start = new Date(this.raw_start + ' UTC');
		return this._start;
	}

	get end() {
		if (this._end !== undefined)
			return this._end;

		this._end = new Date(this.raw_end + ' UTC');
		return this._end;
	}

	get mods() {
		if (this._mods !== undefined)
			return this._mods;

		this._mods = [];
		for (const mod in Constants.Mods)
			if (this.raw_mods & Constants.Mods[mod])
				this._mods.push(mod);


		return this._mods;
	}
}

module.exports = Game;

},{"../Constants.js":8,"./MultiplayerScore.js":13}],12:[function(require,module,exports){
const Game = require('./Game.js');

/**
 * A multiplayer match
 * @prop {String} id
 * @prop {String} name
 * @prop {String} raw_start
 * @prop {?String} raw_end null if not finished
 * @prop {Game[]} games
 * @prop {Date} start
 * @prop {Date} end
 */
class Match {
	constructor(config, data) {
		this.id = data.match.match_id;
		this.name = data.match.name;
		this.raw_start = data.match.start_time;
		this.raw_end = data.match.end_time;

		this.games = data.games.map(g => new Game(config, g));
	}

	get start() {
		if (this._start !== undefined)
			return this._start;

		this._start = new Date(this.raw_start + ' UTC');
		return this._start;
	}

	get end() {
		if (this._end !== undefined)
			return this._end;

		this._end = new Date(this.raw_end + ' UTC');
		return this._end;
	}
}

module.exports = Match;

},{"./Game.js":11}],13:[function(require,module,exports){
const { getNumeric } = require('../utils.js');
const Constants = require('../Constants.js');

/**
 * A multiplayer game score
 * @prop {String|Number} slot
 * @prop {String} team
 * @prop {String} userId
 * @prop {String|Number} score
 * @prop {String|Number} maxCombo
 * @prop {Null} rank
 * @prop {Object} counts
 * @prop {String|Number} counts.300
 * @prop {String|Number} counts.100
 * @prop {String|Number} counts.50
 * @prop {String|Number} counts.geki
 * @prop {String|Number} counts.katu
 * @prop {String|Number} counts.miss
 * @prop {Boolean} perfect
 * @prop {Boolean} pass
 * @prop {Number} raw_mods
 * @prop {String[]} mods
 */
class MultiplayerScore {
	constructor(config, data) {
		const num = getNumeric(config.parseNumeric);

		this.slot = num(data.slot);
		this.team = Constants.Multiplayer.team[data.team];
		this.userId = data.user_id;
		this.score = num(data.score);
		this.maxCombo = num(data.maxcombo);
		this.rank = null; // Not used
		this.counts = {
			'300': num(data.count300),
			'100': num(data.count100),
			'50': num(data.count50),
			'geki': num(data.countgeki),
			'katu': num(data.countkatu),
			'miss': num(data.countmiss)
		};
		this.perfect = data.perfect === '1';
		this.pass = data.pass === '1';
		this.raw_mods = parseInt(data.enabled_mods || '0');
	}

	get mods() {
		if (this._mods !== undefined)
			return this._mods;

		this._mods = [];
		for (const mod in Constants.Mods)
			if (this.raw_mods & Constants.Mods[mod])
				this._mods.push(mod);


		return this._mods;
	}
}

module.exports = MultiplayerScore;

},{"../Constants.js":8,"../utils.js":16}],14:[function(require,module,exports){
const { getNumeric } = require('../utils.js');
const { Mods, AccuracyMethods } = require('../Constants.js');

/**
 * A score for a beatmap
 * @prop {String|Number} score
 * @prop {Object} user
 * @prop {?String} user.name Username of the player. Will be null if using a getUserX method
 * @prop {String} user.id
 * @prop {?String} beatmapId
 * @prop {Object} counts
 * @prop {String|Number} counts.300
 * @prop {String|Number} counts.100
 * @prop {String|Number} counts.50
 * @prop {String|Number} counts.geki
 * @prop {String|Number} counts.katu
 * @prop {String|Number} counts.miss
 * @prop {String|Number} maxCombo
 * @prop {Boolean} perfect
 * @prop {String} raw_date
 * @prop {String} rank
 * @prop {?String|?Number} pp
 * @prop {Boolean} hasReplay
 * @prop {Number} raw_mods bitwise representation of mods used
 * @prop {?Beatmap} beatmap
 * @prop {Date} date
 * @prop {String[]} mods
 * @prop {Number|undefined} accuracy The score's accuracy, if beatmap is defined, otherwise undefined
 */
class Score {
	constructor(config, data, beatmap) {
		const num = getNumeric(config.parseNumeric);

		this.score = num(data.score);
		this.user = {
			'name': data.username || null,
			'id': data.user_id
		};
		this.beatmapId = data.beatmap_id || (beatmap ? beatmap.id : null);
		this.counts = {
			'300': num(data.count300),
			'100': num(data.count100),
			'50': num(data.count50),
			'geki': num(data.countgeki),
			'katu': num(data.countkatu),
			'miss': num(data.countmiss)
		};
		this.maxCombo = num(data.maxcombo);
		this.perfect = data.perfect === '1';
		this.raw_date = data.date;
		this.rank = data.rank;
		this.pp = num(data.pp || null);
		this.hasReplay = data.replay_available === '1';

		this.raw_mods = parseInt(data.enabled_mods);

		this._beatmap = beatmap; // Optional
	}

	get beatmap() {
		return this._beatmap;
	}

	set beatmap(beatmap) {
		this.beatmapId = beatmap.id;
		this._beatmap = beatmap;
	}

	get date() {
		if (this._date !== undefined)
			return this._date;

		this._date = new Date(this.raw_date + ' UTC');
		return this._date;
	}

	get mods() {
		if (this._mods !== undefined)
			return this._mods;

		this._mods = [];
		for (const mod in Mods)
			if (this.raw_mods & Mods[mod])
				this._mods.push(mod);

		return this._mods;
	}

	get accuracy() {
		if (!this.beatmap)
			return undefined;

		if (this._accuracy !== undefined)
			return this._accuracy;

		const intCounts = { };
		for (const c in this.counts)
			intCounts[c] = parseInt(this.counts[c], 10);

		this._accuracy = AccuracyMethods[this.beatmap.mode](intCounts);
		return this._accuracy;
	}
}

module.exports = Score;

},{"../Constants.js":8,"../utils.js":16}],15:[function(require,module,exports){
const { getNumeric } = require('../utils.js');
const Event = require('./Event.js');

/**
 * A user
 * @prop {String} id
 * @prop {String} name
 * @prop {Object} counts
 * @prop {String|Number} counts.300
 * @prop {String|Number} counts.100
 * @prop {String|Number} counts.50
 * @prop {String|Number} counts.SSH
 * @prop {String|Number} counts.SS
 * @prop {String|Number} counts.SH
 * @prop {String|Number} counts.S
 * @prop {String|Number} counts.A
 * @prop {String|Number} counts.plays
 * @prop {Object} scores
 * @prop {String|Number} scores.ranked
 * @prop {String|Number} scores.total
 * @prop {Object} pp
 * @prop {String|Number} pp.raw
 * @prop {String|Number} pp.rank
 * @prop {String|Number} pp.countryRank
 * @prop {String} country
 * @prop {String|Number} level
 * @prop {String|Number} accuracy
 * @prop {String|Number} secondsPlayed
 * @prop {String} raw_joinDate
 * @prop {Event[]} events
 * @prop {String} accuracyFormatted
 * @prop {Date} joinDate
 */
class User {
	constructor(config, data) {
		const num = getNumeric(config.parseNumeric);

		this.id = data.user_id;
		this.name = data.username;
		this.counts = {
			'300': num(data.count300),
			'100': num(data.count100),
			'50': num(data.count50),
			'SSH': num(data.count_rank_ssh),
			'SS': num(data.count_rank_ss),
			'SH': num(data.count_rank_sh),
			'S': num(data.count_rank_s),
			'A': num(data.count_rank_a),
			'plays': num(data.playcount)
		};
		this.scores = {
			ranked: num(data.ranked_score),
			total: num(data.total_score)
		};
		this.pp = {
			raw: num(data.pp_raw),
			rank: num(data.pp_rank),
			countryRank: num(data.pp_country_rank)
		};
		this.country = data.country;
		this.level = num(data.level);
		this.accuracy = num(data.accuracy);
		this.secondsPlayed = num(data.total_seconds_played);
		this.raw_joinDate = data.join_date;

		this.events = data.events.map(ev => new Event(config, ev));
	}

	get joinDate() {
		if (this._joinDate !== undefined)
			return this._joinDate;

		this._joinDate = new Date(this.raw_joinDate + ' UTC');
		return this._joinDate;
	}

	get accuracyFormatted() {
		return parseFloat(this.accuracy).toFixed(2) + '%';
	}

}

module.exports = User;

},{"../utils.js":16,"./Event.js":10}],16:[function(require,module,exports){
module.exports = {
	getNumeric(parseNumeric) {
		return parseNumeric
			? v => v === undefined || v === null ? v : parseFloat(v)
			: v => v;
	}
};

},{}],17:[function(require,module,exports){
module.exports={
  "_from": "node-osu@^2.2.0",
  "_id": "node-osu@2.2.0",
  "_inBundle": false,
  "_integrity": "sha512-Vi++LiGkU83BYsSkba5pE4/Dm02M/oox/9bhrVOtIyjU/bwcDhXoJX2if7SI4i28h7MP8UA/3ReUXSmuyr2/Hg==",
  "_location": "/node-osu",
  "_phantomChildren": {},
  "_requested": {
    "type": "range",
    "registry": true,
    "raw": "node-osu@^2.2.0",
    "name": "node-osu",
    "escapedName": "node-osu",
    "rawSpec": "^2.2.0",
    "saveSpec": null,
    "fetchSpec": "^2.2.0"
  },
  "_requiredBy": [
    "/"
  ],
  "_resolved": "https://registry.npmjs.org/node-osu/-/node-osu-2.2.0.tgz",
  "_shasum": "325f1f1961ebfe288ef1c2c4f7652a91837542e9",
  "_spec": "node-osu@^2.2.0",
  "_where": "/Users/kousakananako/Documents/GitHub/elo-mappool-client",
  "author": {
    "name": "brussell98"
  },
  "bugs": {
    "url": "https://github.com/brussell98/node-osu/issues"
  },
  "bundleDependencies": false,
  "dependencies": {
    "superagent": "^5.2.1"
  },
  "deprecated": false,
  "description": "A library for interacting with the osu api",
  "devDependencies": {
    "chai": "^3.5.0",
    "eslint": "^6.8.0",
    "mocha": "^3.0.2"
  },
  "homepage": "https://github.com/brussell98/node-osu#readme",
  "keywords": [
    "osu",
    "api",
    "es6",
    "promise",
    "async"
  ],
  "license": "MIT",
  "main": "index.js",
  "name": "node-osu",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/brussell98/node-osu.git"
  },
  "scripts": {
    "test": "mocha -t 10000 --reporter spec"
  },
  "version": "2.2.0"
}

},{}],18:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function Agent() {
  this._defaults = [];
}

['use', 'on', 'once', 'set', 'query', 'type', 'accept', 'auth', 'withCredentials', 'sortQuery', 'retry', 'ok', 'redirects', 'timeout', 'buffer', 'serialize', 'parse', 'ca', 'key', 'pfx', 'cert', 'disableTLSCerts'].forEach(function (fn) {
  // Default setting for all requests from this agent
  Agent.prototype[fn] = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this._defaults.push({
      fn: fn,
      args: args
    });

    return this;
  };
});

Agent.prototype._setDefaults = function (req) {
  this._defaults.forEach(function (def) {
    req[def.fn].apply(req, _toConsumableArray(def.args));
  });
};

module.exports = Agent;

},{}],19:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Root reference for iframes.
 */
var root;

if (typeof window !== 'undefined') {
  // Browser window
  root = window;
} else if (typeof self === 'undefined') {
  // Other environments
  console.warn('Using browser-only version of superagent in non-browser environment');
  root = void 0;
} else {
  // Web Worker
  root = self;
}

var Emitter = require('component-emitter');

var safeStringify = require('fast-safe-stringify');

var RequestBase = require('./request-base');

var isObject = require('./is-object');

var ResponseBase = require('./response-base');

var Agent = require('./agent-base');
/**
 * Noop.
 */


function noop() {}
/**
 * Expose `request`.
 */


module.exports = function (method, url) {
  // callback
  if (typeof url === 'function') {
    return new exports.Request('GET', method).end(url);
  } // url first


  if (arguments.length === 1) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
};

exports = module.exports;
var request = exports;
exports.Request = Request;
/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest && (!root.location || root.location.protocol !== 'file:' || !root.ActiveXObject)) {
    return new XMLHttpRequest();
  }

  try {
    return new ActiveXObject('Microsoft.XMLHTTP');
  } catch (_unused) {}

  try {
    return new ActiveXObject('Msxml2.XMLHTTP.6.0');
  } catch (_unused2) {}

  try {
    return new ActiveXObject('Msxml2.XMLHTTP.3.0');
  } catch (_unused3) {}

  try {
    return new ActiveXObject('Msxml2.XMLHTTP');
  } catch (_unused4) {}

  throw new Error('Browser-only version of superagent could not find XHR');
};
/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */


var trim = ''.trim ? function (s) {
  return s.trim();
} : function (s) {
  return s.replace(/(^\s*|\s*$)/g, '');
};
/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) pushEncodedKeyValuePair(pairs, key, obj[key]);
  }

  return pairs.join('&');
}
/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */


function pushEncodedKeyValuePair(pairs, key, val) {
  if (val === undefined) return;

  if (val === null) {
    pairs.push(encodeURI(key));
    return;
  }

  if (Array.isArray(val)) {
    val.forEach(function (v) {
      pushEncodedKeyValuePair(pairs, key, v);
    });
  } else if (isObject(val)) {
    for (var subkey in val) {
      if (Object.prototype.hasOwnProperty.call(val, subkey)) pushEncodedKeyValuePair(pairs, "".concat(key, "[").concat(subkey, "]"), val[subkey]);
    }
  } else {
    pairs.push(encodeURI(key) + '=' + encodeURIComponent(val));
  }
}
/**
 * Expose serialization method.
 */


request.serializeObject = serialize;
/**
 * Parse the given x-www-form-urlencoded `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var pair;
  var pos;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');

    if (pos === -1) {
      obj[decodeURIComponent(pair)] = '';
    } else {
      obj[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return obj;
}
/**
 * Expose parser.
 */


request.parseString = parseString;
/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'text/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  form: 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};
/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

request.serialize = {
  'application/x-www-form-urlencoded': serialize,
  'application/json': safeStringify
};
/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(str){
 *       return { object parsed from str };
 *     };
 *
 */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};
/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');

    if (index === -1) {
      // could be empty line, just skip it
      continue;
    }

    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}
/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */


function isJSON(mime) {
  // should match /json or +json
  // but not /json-seq
  return /[/+]json($|[^-\w])/.test(mime);
}
/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */


function Response(req) {
  this.req = req;
  this.xhr = this.req.xhr; // responseText is accessible only if responseType is '' or 'text' and on older browsers

  this.text = this.req.method !== 'HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text') || typeof this.xhr.responseType === 'undefined' ? this.xhr.responseText : null;
  this.statusText = this.req.xhr.statusText;
  var status = this.xhr.status; // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request

  if (status === 1223) {
    status = 204;
  }

  this._setStatusProperties(status);

  this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  this.header = this.headers; // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.

  this.header['content-type'] = this.xhr.getResponseHeader('content-type');

  this._setHeaderProperties(this.header);

  if (this.text === null && req._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method === 'HEAD' ? null : this._parseBody(this.text ? this.text : this.xhr.response);
  }
} // eslint-disable-next-line new-cap


ResponseBase(Response.prototype);
/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function (str) {
  var parse = request.parse[this.type];

  if (this.req._parser) {
    return this.req._parser(this, str);
  }

  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }

  return parse && str && (str.length > 0 || str instanceof Object) ? parse(str) : null;
};
/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */


Response.prototype.toError = function () {
  var req = this.req;
  var method = req.method;
  var url = req.url;
  var msg = "cannot ".concat(method, " ").concat(url, " (").concat(this.status, ")");
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;
  return err;
};
/**
 * Expose `Response`.
 */


request.Response = Response;
/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case

  this._header = {}; // coerces header names to lowercase

  this.on('end', function () {
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch (err_) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = err_; // issue #675: return the raw response if the response parsing fails

      if (self.xhr) {
        // ie9 doesn't have 'response' property
        err.rawResponse = typeof self.xhr.responseType === 'undefined' ? self.xhr.responseText : self.xhr.response; // issue #876: return the http status code if the response parsing fails

        err.status = self.xhr.status ? self.xhr.status : null;
        err.statusCode = err.status; // backwards-compat only
      } else {
        err.rawResponse = null;
        err.status = null;
      }

      return self.callback(err);
    }

    self.emit('response', res);
    var new_err;

    try {
      if (!self._isResponseOK(res)) {
        new_err = new Error(res.statusText || res.text || 'Unsuccessful HTTP response');
      }
    } catch (err_) {
      new_err = err_; // ok() callback can throw
    } // #1000 don't catch errors from the callback to avoid double calling it


    if (new_err) {
      new_err.original = err;
      new_err.response = res;
      new_err.status = res.status;
      self.callback(new_err, res);
    } else {
      self.callback(null, res);
    }
  });
}
/**
 * Mixin `Emitter` and `RequestBase`.
 */
// eslint-disable-next-line new-cap


Emitter(Request.prototype); // eslint-disable-next-line new-cap

RequestBase(Request.prototype);
/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function (type) {
  this.set('Content-Type', request.types[type] || type);
  return this;
};
/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.accept = function (type) {
  this.set('Accept', request.types[type] || type);
  return this;
};
/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} [pass] optional in case of using 'bearer' as type
 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.auth = function (user, pass, options) {
  if (arguments.length === 1) pass = '';

  if (_typeof(pass) === 'object' && pass !== null) {
    // pass is optional and can be replaced with options
    options = pass;
    pass = '';
  }

  if (!options) {
    options = {
      type: typeof btoa === 'function' ? 'basic' : 'auto'
    };
  }

  var encoder = function encoder(string) {
    if (typeof btoa === 'function') {
      return btoa(string);
    }

    throw new Error('Cannot use basic auth, btoa is not a function');
  };

  return this._auth(user, pass, options, encoder);
};
/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.query = function (val) {
  if (typeof val !== 'string') val = serialize(val);
  if (val) this._query.push(val);
  return this;
};
/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.attach = function (field, file, options) {
  if (file) {
    if (this._data) {
      throw new Error("superagent can't mix .send() and .attach()");
    }

    this._getFormData().append(field, file, options || file.name);
  }

  return this;
};

Request.prototype._getFormData = function () {
  if (!this._formData) {
    this._formData = new root.FormData();
  }

  return this._formData;
};
/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */


Request.prototype.callback = function (err, res) {
  if (this._shouldRetry(err, res)) {
    return this._retry();
  }

  var fn = this._callback;
  this.clearTimeout();

  if (err) {
    if (this._maxRetries) err.retries = this._retries - 1;
    this.emit('error', err);
  }

  fn(err, res);
};
/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */


Request.prototype.crossDomainError = function () {
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;
  err.status = this.status;
  err.method = this.method;
  err.url = this.url;
  this.callback(err);
}; // This only warns, because the request is still likely to work


Request.prototype.agent = function () {
  console.warn('This is not supported in browser version of superagent');
  return this;
};

Request.prototype.ca = Request.prototype.agent;
Request.prototype.buffer = Request.prototype.ca; // This throws, because it can't send/receive data as expected

Request.prototype.write = function () {
  throw new Error('Streaming is not supported in browser version of superagent');
};

Request.prototype.pipe = Request.prototype.write;
/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj host object
 * @return {Boolean} is a host object
 * @api private
 */

Request.prototype._isHost = function (obj) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return obj && _typeof(obj) === 'object' && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
};
/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.end = function (fn) {
  if (this._endCalled) {
    console.warn('Warning: .end() was called twice. This is not supported in superagent');
  }

  this._endCalled = true; // store callback

  this._callback = fn || noop; // querystring

  this._finalizeQueryString();

  this._end();
};

Request.prototype._setUploadTimeout = function () {
  var self = this; // upload timeout it's wokrs only if deadline timeout is off

  if (this._uploadTimeout && !this._uploadTimeoutTimer) {
    this._uploadTimeoutTimer = setTimeout(function () {
      self._timeoutError('Upload timeout of ', self._uploadTimeout, 'ETIMEDOUT');
    }, this._uploadTimeout);
  }
}; // eslint-disable-next-line complexity


Request.prototype._end = function () {
  if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
  var self = this;
  this.xhr = request.getXHR();
  var xhr = this.xhr;
  var data = this._formData || this._data;

  this._setTimeouts(); // state change


  xhr.onreadystatechange = function () {
    var readyState = xhr.readyState;

    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }

    if (readyState !== 4) {
      return;
    } // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"


    var status;

    try {
      status = xhr.status;
    } catch (_unused5) {
      status = 0;
    }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }

    self.emit('end');
  }; // progress


  var handleProgress = function handleProgress(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;

      if (e.percent === 100) {
        clearTimeout(self._uploadTimeoutTimer);
      }
    }

    e.direction = direction;
    self.emit('progress', e);
  };

  if (this.hasListeners('progress')) {
    try {
      xhr.addEventListener('progress', handleProgress.bind(null, 'download'));

      if (xhr.upload) {
        xhr.upload.addEventListener('progress', handleProgress.bind(null, 'upload'));
      }
    } catch (_unused6) {// Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  if (xhr.upload) {
    this._setUploadTimeout();
  } // initiate request


  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  } // CORS


  if (this._withCredentials) xhr.withCredentials = true; // body

  if (!this._formData && this.method !== 'GET' && this.method !== 'HEAD' && typeof data !== 'string' && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];

    var _serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];

    if (!_serialize && isJSON(contentType)) {
      _serialize = request.serialize['application/json'];
    }

    if (_serialize) data = _serialize(data);
  } // set header fields


  for (var field in this.header) {
    if (this.header[field] === null) continue;
    if (Object.prototype.hasOwnProperty.call(this.header, field)) xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  } // send stuff


  this.emit('request', this); // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined

  xhr.send(typeof data === 'undefined' ? null : data);
};

request.agent = function () {
  return new Agent();
};

['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'].forEach(function (method) {
  Agent.prototype[method.toLowerCase()] = function (url, fn) {
    var req = new request.Request(method, url);

    this._setDefaults(req);

    if (fn) {
      req.end(fn);
    }

    return req;
  };
});
Agent.prototype.del = Agent.prototype.delete;
/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function (url, data, fn) {
  var req = request('GET', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.head = function (url, data, fn) {
  var req = request('HEAD', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.options = function (url, data, fn) {
  var req = request('OPTIONS', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * DELETE `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


function del(url, data, fn) {
  var req = request('DELETE', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
}

request.del = del;
request.delete = del;
/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function (url, data, fn) {
  var req = request('PATCH', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.post = function (url, data, fn) {
  var req = request('POST', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.put = function (url, data, fn) {
  var req = request('PUT', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./agent-base":18,"./is-object":20,"./request-base":21,"./response-base":22,"component-emitter":2,"fast-safe-stringify":3}],20:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
function isObject(obj) {
  return obj !== null && _typeof(obj) === 'object';
}

module.exports = isObject;

},{}],21:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');
/**
 * Expose `RequestBase`.
 */


module.exports = RequestBase;
/**
 * Initialize a new `RequestBase`.
 *
 * @api public
 */

function RequestBase(obj) {
  if (obj) return mixin(obj);
}
/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */


function mixin(obj) {
  for (var key in RequestBase.prototype) {
    if (Object.prototype.hasOwnProperty.call(RequestBase.prototype, key)) obj[key] = RequestBase.prototype[key];
  }

  return obj;
}
/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.clearTimeout = function () {
  clearTimeout(this._timer);
  clearTimeout(this._responseTimeoutTimer);
  clearTimeout(this._uploadTimeoutTimer);
  delete this._timer;
  delete this._responseTimeoutTimer;
  delete this._uploadTimeoutTimer;
  return this;
};
/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */


RequestBase.prototype.parse = function (fn) {
  this._parser = fn;
  return this;
};
/**
 * Set format of binary response body.
 * In browser valid formats are 'blob' and 'arraybuffer',
 * which return Blob and ArrayBuffer, respectively.
 *
 * In Node all values result in Buffer.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.responseType = function (val) {
  this._responseType = val;
  return this;
};
/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */


RequestBase.prototype.serialize = function (fn) {
  this._serializer = fn;
  return this;
};
/**
 * Set timeouts.
 *
 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
 * - upload is the time  since last bit of data was sent or received. This timeout works only if deadline timeout is off
 *
 * Value of 0 or false means no timeout.
 *
 * @param {Number|Object} ms or {response, deadline}
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.timeout = function (options) {
  if (!options || _typeof(options) !== 'object') {
    this._timeout = options;
    this._responseTimeout = 0;
    this._uploadTimeout = 0;
    return this;
  }

  for (var option in options) {
    if (Object.prototype.hasOwnProperty.call(options, option)) {
      switch (option) {
        case 'deadline':
          this._timeout = options.deadline;
          break;

        case 'response':
          this._responseTimeout = options.response;
          break;

        case 'upload':
          this._uploadTimeout = options.upload;
          break;

        default:
          console.warn('Unknown timeout option', option);
      }
    }
  }

  return this;
};
/**
 * Set number of retry attempts on error.
 *
 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
 *
 * @param {Number} count
 * @param {Function} [fn]
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.retry = function (count, fn) {
  // Default to 1 if no count passed or true
  if (arguments.length === 0 || count === true) count = 1;
  if (count <= 0) count = 0;
  this._maxRetries = count;
  this._retries = 0;
  this._retryCallback = fn;
  return this;
};

var ERROR_CODES = ['ECONNRESET', 'ETIMEDOUT', 'EADDRINFO', 'ESOCKETTIMEDOUT'];
/**
 * Determine if a request should be retried.
 * (Borrowed from segmentio/superagent-retry)
 *
 * @param {Error} err an error
 * @param {Response} [res] response
 * @returns {Boolean} if segment should be retried
 */

RequestBase.prototype._shouldRetry = function (err, res) {
  if (!this._maxRetries || this._retries++ >= this._maxRetries) {
    return false;
  }

  if (this._retryCallback) {
    try {
      var override = this._retryCallback(err, res);

      if (override === true) return true;
      if (override === false) return false; // undefined falls back to defaults
    } catch (err_) {
      console.error(err_);
    }
  }

  if (res && res.status && res.status >= 500 && res.status !== 501) return true;

  if (err) {
    if (err.code && ERROR_CODES.includes(err.code)) return true; // Superagent timeout

    if (err.timeout && err.code === 'ECONNABORTED') return true;
    if (err.crossDomain) return true;
  }

  return false;
};
/**
 * Retry request
 *
 * @return {Request} for chaining
 * @api private
 */


RequestBase.prototype._retry = function () {
  this.clearTimeout(); // node

  if (this.req) {
    this.req = null;
    this.req = this.request();
  }

  this._aborted = false;
  this.timedout = false;
  this.timedoutError = null;
  return this._end();
};
/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} [reject]
 * @return {Request}
 */


RequestBase.prototype.then = function (resolve, reject) {
  var _this = this;

  if (!this._fullfilledPromise) {
    var self = this;

    if (this._endCalled) {
      console.warn('Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises');
    }

    this._fullfilledPromise = new Promise(function (resolve, reject) {
      self.on('abort', function () {
        if (_this.timedout && _this.timedoutError) {
          reject(_this.timedoutError);
          return;
        }

        var err = new Error('Aborted');
        err.code = 'ABORTED';
        err.status = _this.status;
        err.method = _this.method;
        err.url = _this.url;
        reject(err);
      });
      self.end(function (err, res) {
        if (err) reject(err);else resolve(res);
      });
    });
  }

  return this._fullfilledPromise.then(resolve, reject);
};

RequestBase.prototype.catch = function (cb) {
  return this.then(undefined, cb);
};
/**
 * Allow for extension
 */


RequestBase.prototype.use = function (fn) {
  fn(this);
  return this;
};

RequestBase.prototype.ok = function (cb) {
  if (typeof cb !== 'function') throw new Error('Callback required');
  this._okCallback = cb;
  return this;
};

RequestBase.prototype._isResponseOK = function (res) {
  if (!res) {
    return false;
  }

  if (this._okCallback) {
    return this._okCallback(res);
  }

  return res.status >= 200 && res.status < 300;
};
/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */


RequestBase.prototype.get = function (field) {
  return this._header[field.toLowerCase()];
};
/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */


RequestBase.prototype.getHeader = RequestBase.prototype.get;
/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.set = function (field, val) {
  if (isObject(field)) {
    for (var key in field) {
      if (Object.prototype.hasOwnProperty.call(field, key)) this.set(key, field[key]);
    }

    return this;
  }

  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};
/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field field name
 */


RequestBase.prototype.unset = function (field) {
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};
/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name name of field
 * @param {String|Blob|File|Buffer|fs.ReadStream} val value of field
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.field = function (name, val) {
  // name should be either a string or an object.
  if (name === null || undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (this._data) {
    throw new Error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject(name)) {
    for (var key in name) {
      if (Object.prototype.hasOwnProperty.call(name, key)) this.field(key, name[key]);
    }

    return this;
  }

  if (Array.isArray(val)) {
    for (var i in val) {
      if (Object.prototype.hasOwnProperty.call(val, i)) this.field(name, val[i]);
    }

    return this;
  } // val should be defined now


  if (val === null || undefined === val) {
    throw new Error('.field(name, val) val can not be empty');
  }

  if (typeof val === 'boolean') {
    val = String(val);
  }

  this._getFormData().append(name, val);

  return this;
};
/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request} request
 * @api public
 */


RequestBase.prototype.abort = function () {
  if (this._aborted) {
    return this;
  }

  this._aborted = true;
  if (this.xhr) this.xhr.abort(); // browser

  if (this.req) this.req.abort(); // node

  this.clearTimeout();
  this.emit('abort');
  return this;
};

RequestBase.prototype._auth = function (user, pass, options, base64Encoder) {
  switch (options.type) {
    case 'basic':
      this.set('Authorization', "Basic ".concat(base64Encoder("".concat(user, ":").concat(pass))));
      break;

    case 'auto':
      this.username = user;
      this.password = pass;
      break;

    case 'bearer':
      // usage would be .auth(accessToken, { type: 'bearer' })
      this.set('Authorization', "Bearer ".concat(user));
      break;

    default:
      break;
  }

  return this;
};
/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */


RequestBase.prototype.withCredentials = function (on) {
  // This is browser-only functionality. Node side is no-op.
  if (on === undefined) on = true;
  this._withCredentials = on;
  return this;
};
/**
 * Set the max redirects to `n`. Does nothing in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.redirects = function (n) {
  this._maxRedirects = n;
  return this;
};
/**
 * Maximum size of buffered response body, in bytes. Counts uncompressed size.
 * Default 200MB.
 *
 * @param {Number} n number of bytes
 * @return {Request} for chaining
 */


RequestBase.prototype.maxResponseSize = function (n) {
  if (typeof n !== 'number') {
    throw new TypeError('Invalid argument');
  }

  this._maxResponseSize = n;
  return this;
};
/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */


RequestBase.prototype.toJSON = function () {
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header
  };
};
/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */
// eslint-disable-next-line complexity


RequestBase.prototype.send = function (data) {
  var isObj = isObject(data);
  var type = this._header['content-type'];

  if (this._formData) {
    throw new Error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObj && !this._data) {
    if (Array.isArray(data)) {
      this._data = [];
    } else if (!this._isHost(data)) {
      this._data = {};
    }
  } else if (data && this._data && this._isHost(this._data)) {
    throw new Error("Can't merge these send calls");
  } // merge


  if (isObj && isObject(this._data)) {
    for (var key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) this._data[key] = data[key];
    }
  } else if (typeof data === 'string') {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];

    if (type === 'application/x-www-form-urlencoded') {
      this._data = this._data ? "".concat(this._data, "&").concat(data) : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!isObj || this._isHost(data)) {
    return this;
  } // default to json


  if (!type) this.type('json');
  return this;
};
/**
 * Sort `querystring` by the sort function
 *
 *
 * Examples:
 *
 *       // default order
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery()
 *         .end(callback)
 *
 *       // customized sort function
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery(function(a, b){
 *           return a.length - b.length;
 *         })
 *         .end(callback)
 *
 *
 * @param {Function} sort
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.sortQuery = function (sort) {
  // _sort default to true but otherwise can be a function or boolean
  this._sort = typeof sort === 'undefined' ? true : sort;
  return this;
};
/**
 * Compose querystring to append to req.url
 *
 * @api private
 */


RequestBase.prototype._finalizeQueryString = function () {
  var query = this._query.join('&');

  if (query) {
    this.url += (this.url.includes('?') ? '&' : '?') + query;
  }

  this._query.length = 0; // Makes the call idempotent

  if (this._sort) {
    var index = this.url.indexOf('?');

    if (index >= 0) {
      var queryArr = this.url.slice(index + 1).split('&');

      if (typeof this._sort === 'function') {
        queryArr.sort(this._sort);
      } else {
        queryArr.sort();
      }

      this.url = this.url.slice(0, index) + '?' + queryArr.join('&');
    }
  }
}; // For backwards compat only


RequestBase.prototype._appendQueryString = function () {
  console.warn('Unsupported');
};
/**
 * Invoke callback with timeout error.
 *
 * @api private
 */


RequestBase.prototype._timeoutError = function (reason, timeout, errno) {
  if (this._aborted) {
    return;
  }

  var err = new Error("".concat(reason + timeout, "ms exceeded"));
  err.timeout = timeout;
  err.code = 'ECONNABORTED';
  err.errno = errno;
  this.timedout = true;
  this.timedoutError = err;
  this.abort();
  this.callback(err);
};

RequestBase.prototype._setTimeouts = function () {
  var self = this; // deadline

  if (this._timeout && !this._timer) {
    this._timer = setTimeout(function () {
      self._timeoutError('Timeout of ', self._timeout, 'ETIME');
    }, this._timeout);
  } // response timeout


  if (this._responseTimeout && !this._responseTimeoutTimer) {
    this._responseTimeoutTimer = setTimeout(function () {
      self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
    }, this._responseTimeout);
  }
};

},{"./is-object":20}],22:[function(require,module,exports){
"use strict";

/**
 * Module dependencies.
 */
var utils = require('./utils');
/**
 * Expose `ResponseBase`.
 */


module.exports = ResponseBase;
/**
 * Initialize a new `ResponseBase`.
 *
 * @api public
 */

function ResponseBase(obj) {
  if (obj) return mixin(obj);
}
/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */


function mixin(obj) {
  for (var key in ResponseBase.prototype) {
    if (Object.prototype.hasOwnProperty.call(ResponseBase.prototype, key)) obj[key] = ResponseBase.prototype[key];
  }

  return obj;
}
/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */


ResponseBase.prototype.get = function (field) {
  return this.header[field.toLowerCase()];
};
/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */


ResponseBase.prototype._setHeaderProperties = function (header) {
  // TODO: moar!
  // TODO: make this a util
  // content-type
  var ct = header['content-type'] || '';
  this.type = utils.type(ct); // params

  var params = utils.params(ct);

  for (var key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) this[key] = params[key];
  }

  this.links = {}; // links

  try {
    if (header.link) {
      this.links = utils.parseLinks(header.link);
    }
  } catch (_unused) {// ignore
  }
};
/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */


ResponseBase.prototype._setStatusProperties = function (status) {
  var type = status / 100 | 0; // status / class

  this.statusCode = status;
  this.status = this.statusCode;
  this.statusType = type; // basics

  this.info = type === 1;
  this.ok = type === 2;
  this.redirect = type === 3;
  this.clientError = type === 4;
  this.serverError = type === 5;
  this.error = type === 4 || type === 5 ? this.toError() : false; // sugar

  this.created = status === 201;
  this.accepted = status === 202;
  this.noContent = status === 204;
  this.badRequest = status === 400;
  this.unauthorized = status === 401;
  this.notAcceptable = status === 406;
  this.forbidden = status === 403;
  this.notFound = status === 404;
  this.unprocessableEntity = status === 422;
};

},{"./utils":23}],23:[function(require,module,exports){
"use strict";

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */
exports.type = function (str) {
  return str.split(/ *; */).shift();
};
/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */


exports.params = function (str) {
  return str.split(/ *; */).reduce(function (obj, str) {
    var parts = str.split(/ *= */);
    var key = parts.shift();
    var val = parts.shift();
    if (key && val) obj[key] = val;
    return obj;
  }, {});
};
/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */


exports.parseLinks = function (str) {
  return str.split(/ *, */).reduce(function (obj, str) {
    var parts = str.split(/ *; */);
    var url = parts[0].slice(1, -1);
    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
    obj[rel] = url;
    return obj;
  }, {});
};
/**
 * Strip content related fields from `header`.
 *
 * @param {Object} header
 * @return {Object} header
 * @api private
 */


exports.cleanHeader = function (header, changesOrigin) {
  delete header['content-type'];
  delete header['content-length'];
  delete header['transfer-encoding'];
  delete header.host; // secuirty

  if (changesOrigin) {
    delete header.authorization;
    delete header.cookie;
  }

  return header;
};

},{}],"elo-mappool-api":[function(require,module,exports){
const node_osu = require('node-osu');
// const { URL, URLSearchParams } = require('url');
const xhr = require('./httpio');

//User
//same as node-osu User
function User(user, api) {
    this.id = user.id || -1;
    this.name = user.name || 'Guest';
    this.api = api;
}
User.prototype.fromNodeOsuUser = function(user, api) {
    return new User(user, api);
}
User.prototype.getMyVoteOnPool = async function(pool) {
    const results = await pool.api.getPoolVotes(pool, this);
    return results[0] ||  {
        vote: 0,
        submitter: this.id,
    }
}
User.prototype.upvotePool = function(pool) {
    return pool.api.votePool(1, pool, this);
}
User.prototype.downvotePool = function(pool) {
    return pool.api.votePool(-1, pool, this);
}
User.prototype.unvotePool = function(pool) {
    return pool.api.votePool(0, pool, this);
}


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

MapPool.prototype.httpReq = async function(request, onSuccess) {
    return xhr(request, onSuccess);
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
    return new Pool(result, this);
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


//votes


MapPool.prototype.getPoolVotes = function({ name }, { id = '' } = {}) {
    const url = `${this.base}/pools/${name}/votes/${id}`
    const result = this.httpReq({ url });
    return result;
}

MapPool.prototype.votePool = function(upvote, pool, user) {
    const url = `${this.base}/pools/${pool.name}/votes`
    const body = JSON.stringify({
        vote: upvote,
        submitter: user.id,
    });
    const result = this.httpReq({ url, body, method: "POST" });
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
Pool.prototype.getVotes = function() {
    return this.api.getPoolVotes(this);
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
exports.User = User;
},{"./httpio":1,"node-osu":6}]},{},[]);
