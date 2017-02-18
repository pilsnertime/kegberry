var DB = require('nosql');
var Guid = require('guid');

function Users(db)
{
	this.nosql = DB.load(db);

	this.addUser = (user, callback) => {
		var guid = Guid.create();
		if (!user || !user.userName) {
			callback("User object with a 'name' property wasn't passed in!", null);
		} else {
			this.nosql.find().make( (builder) => {
				builder.search('name', user.userName);
				builder.callback((err, existing) => {
					if (existing && existing.length > 0) {
						callback("User names must be unique!", null);
					} else {
						this.nosql.insert({ id: guid, name: user.userName }).callback(function(err) {
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
	};

	this.getUsers = (callback) => {
		this.nosql.find().make( (builder) => {
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
	};

	this.getUser = (userId, callback) => {
		this.nosql.find().make( (builder) => {
			builder.search('id', userId);
			builder.callback((err, user) => {
				if (err) {
					callback(err, null);
				} else {
					callback(null, user);
				}
			});
		});
	};

}

function ExposeUsers(db) {
	return new Users(db);
}

module.exports = ExposeUsers;