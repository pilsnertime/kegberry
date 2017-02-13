var DB = require('nosql');
var nosql = DB.load('./db/pours.nosql');

function addPour(pour, callback) {

	if (!pour || !pour.userId || !pour.beerId || !pour.amount) {

		callback("User object with a 'name' property wasn't passed in!", null);

	} else {
		var timestamp = Date.now();
		nosql.insert({ timestamp: timestamp, userId: pour.userId, beerId: pour.beerId, amount: pour.amount}).callback(
			err => {
				if (err) {
					callback(err, null);
				} else {
					callback(null, true);
				}
			}
		);

	}
}

function getLastPours(number, callback) {
	if (number < 1) {
		callback("Specify a number greater than zero for last n pours.", null);
	} else {
		nosql.find().make( (builder) => {
			builder.sort('timestamp', true);
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
}

function getPoursInPeriod(begDate, endDate, callback) {
	if (!begDate || !endDate) {
		callback("Specify a beginning and ending timestamp for the period of pours.", null);
	} else {
		nosql.find().make( (builder) => {
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
}

module.exports.addPour = addPour;
module.exports.getLastPours = getLastPours;
module.exports.getPoursInPeriod = getPoursInPeriod;