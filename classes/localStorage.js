module.exports = {
  create() {
  	const storage = localStorage
    return {
    	has(key) {
    		return storage[key] !== undefined
    	}
    	get(key) {
    		return storage[key]
    	}
    	set(key,vaule) {
    		storage[key] = value
    	}
    }
  },

}
