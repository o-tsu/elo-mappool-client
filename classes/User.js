// User
// same as node-osu User
export class User {
  constructor (user, api) {
    this.id = user.id || -1
    this.name = user.name || 'Guest'
    this.api = api
  }

  // sync-----------------------------------------------

  fromNodeOsuUser (user, api) {
    return new User(user, api)
  }

  upvotePool (pool) {
    return pool.api.votePool(1, pool, this)
  }

  downvotePool (pool) {
    return pool.api.votePool(-1, pool, this)
  }

  unvotePool (pool) {
    return pool.api.votePool(0, pool, this)
  }

  // async-----------------------------------------------

  async getMyVoteOnPool (pool) {
    const results = await pool.api.getPoolVotes(pool, this)
    return results[0] || {
      vote: 0,
      submitter: this.id
    }
  }
}
