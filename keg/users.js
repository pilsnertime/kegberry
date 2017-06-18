var DB = require('nosql');
var Guid = require('guid');

function Users(db)
{
	this.DEFAULT_USER_ID = "default_user";
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
						this.nosql.insert({ id: guid, name: user.userName }).callback( (err) => {
							if (err) {
								callback(err, null);
							} else {
								this.getUser(guid.toString(), (err, user) => {
									if (err)
									{
										callback("Could not get user right after PUT", null);
									}
									else {
										callback(null, user);
									}									
								});
							}
						});
					}
				});
			});
		}
	};

	this.getUsers = (callback) => {
		this.nosql.find().make( (builder) => {
			builder.where("id", "!=", this.DEFAULT_USER_ID)
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
					if(user.length != 1) {
						console.log("Unexpectedly found "+user.length+" users with id "+userId);
					}
					callback(null, user[0]);
				}
			});
		});
	};

	this.getDefaultUser = (callback) => {
		this.nosql.find().make( (builder) => {
			builder.search('id', this.DEFAULT_USER_ID);
			builder.callback((err, user) => {
				if (err) {
					callback(err, null);
				} else {
					if(user.length != 1) {
						console.log("Unexpectedly found "+user.length+" default users");
					}
					callback(null, user[0]);
				}
			});
		});
	};

}

function ExposeUsers(db) {
	return new Users(db);
}

module.exports = ExposeUsers;