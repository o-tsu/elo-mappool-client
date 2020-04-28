MapPool {
    id: Number,
    name: String,
    status: String,
    description: String,
    recommendElo: Number,
    cover: Number,
    creator: Number (User.id),
    submitter: Number (User.id),
    rating:{
    	avg: Number,
    	counts: Number,
    },
    maps: MapList[
    	EloMap {
    		id: Number,
    		mod: [String],
    		index: Number,
    		stage: String,
    		selector: Number (User.id),
    		submitter: Number (User.id),
    	}
    ],
    comments: [
    	Comment: {
    		id: Number (User.id),
    		reply: Number (Comment.id),
    		submitter: Number,
    		comment: String,
    		timestamp: Date,
    	}
    ]
}

User {
	id: Number,
	name: String,
}