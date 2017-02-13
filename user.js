var DB = require('nosql');
var nosql = DB.load('./db/users.nosql');
var Guid = require('guid');

function addUser(user, callback) {
	var guid = Guid.create();
	if (!user || !user.name) {
		callback("User object with a 'name' property wasn't passed in!", null);
	} else {
		nosql.find().make( (builder) => {
			builder.search('name', user.name);
			builder.callback((err, existing) => {
				if (existing && existing.length > 0) {
					callback("User names must be unique!", null);
				} else {
					nosql.insert({ id: guid, name: user.name }).callback(function(err) {
						if (err) {
							callback(err, null);
						} else {
							callback(null, guid);
						}
					});
				}
			});
		});
	}
}

function getUsers(callback) {
	nosql.find().make( (builder) => {
	    builder.callback(
	    	(err, response) => {
	    		if (err) {
	    			callback(err, null);
	    		} else {
	    			callback(null, response);
	    		}
	    	}
	    );
	});
}

function getUser(userId, callback) {
	nosql.find().make( (builder) => {
		builder.search('id', userId);
		builder.callback((err, user) => {
			if (err) {
				callback(err, null);
			} else {
				callback(null, user);
			}
		});
	});
}

module.exports.addUser = addUser;
module.exports.getUsers = getUsers;
module.exports.getUser = getUser;