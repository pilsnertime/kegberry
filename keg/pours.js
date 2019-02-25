var DB = require('nosql');

function Pours(db)
{
	this.nosql = DB.load(db);

	this.addPour = (pour, callback) => {
		console.log(pour);
		if (!pour || !pour.userId || !pour.beerId || !pour.amount) {

			callback("Invalid pour object was passed in!", null);

		} else {
			var timestamp = Date.now();
			this.nosql.insert({ timestamp: timestamp, userId: pour.userId, beerId: pour.beerId, amount: pour.amount}).callback(
				err => {
					if (err) {
						callback(err, null);
					} else {
						callback(null, true);
					}
				}
			);
		}
	};

	this.getLastPours = (number, callback) => {
		if (number == undefined || number < 1) {
			callback("Specify a number greater than zero for last n pours.", null);
		} else {
			this.nosql.find().make( (builder) => {
				builder.sort('timestamp', true);
				builder.filter((pour) => pour.timestamp > 0);
				builder.take(number);
				builder.callback( (err, response) => {
					if (err) {
						callback(err, null);
					} else {
						callback(null, response);
					}
				});
			});
		}
	};

	this.getPoursInPeriod = (begDate, endDate, callback) => {
		if (!begDate || !endDate) {
			callback("Specify a beginning and ending timestamp for the period of pours.", null);
		} else {
			this.nosql.find().make( (builder) => {
				builder.between('timestamp', begDate, endDate);
				builder.callback( (err, response) => {
					if (err) {
						callback(err, null);
					} else {
						callback(null, response);
					}
				});
			});
		}
	};

	this.getSessionTopPourers = (durationInHours, callback) => {
		if (durationInHours == undefined || durationInHours < 0) {
			callback("Specify a number greater than zero for session duration in hours.", null);
		} else {
			this.nosql.find().make( (builder) => {
				builder.sort('timestamp', true);
				builder.filter((pour) => pour.timestamp > Date.now() - durationInHours*60*60*1000);
				builder.callback( (err, response) => {
					if (err) {
						callback(err, null);
					} else {
						var map = new Map();
						response.forEach((pour) => {
							if (map.has(pour.userId))
							{
								map.set(pour.userId, map.get(pour.userId) + pour.amount);
							}
							else
							{
								map.set(pour.userId, pour.amount);
							}
						});
						var result = [];
						[...map].sort((a, b) => {return b[1] - a[1];}).forEach((count) => {
						  result.push({userId: count[0], amount: count[1]});
						});
						callback(null, result);
					}
				});
			});
		}
	};
}

function ExposePours(db) {
	return new Pours(db);
}

module.exports = ExposePours;