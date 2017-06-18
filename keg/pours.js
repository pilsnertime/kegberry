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
		if (number < 1) {
			callback("Specify a number greater than zero for last n pours.", null);
		} else {
			this.nosql.find().make( (builder) => {
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
}

function ExposePours(db) {
	return new Pours(db);
}

module.exports = ExposePours;