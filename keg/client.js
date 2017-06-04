
var flowmeter = require('./flowmeter')({
	pin: 40,
	tickCalibration: 0.00089711713,
	timeBetweenPours: 3000, 
	notificationMl: 100
});

var total = 0;

flowmeter.on('pourUpdate', function(data){
	console.log("Keep pouring!!! So far: " + (data*1000).toFixed(1) + " mL");
});

flowmeter.on('finishedPour', function(data){
	console.log("Nice pour: " + (data*1000).toFixed(1) + " mL");
	total += data;
	console.log("\nTotal beer drank so far: " + total.toFixed(2) + " Liters");
});


var users = require('./users.js');
var pourHistory = require('./pourHistory.js')

users.addUser({name: "Ilshat"}, (err, guid) => {
	if(err) {
		console.log("error: "+err);
	} else {
		console.log("successfully added user: "+ guid);
	}
});

users.getUsers((err, users) => {
	if(err) {
		console.log("error: "+err);
	} else {
		//console.log(users);
	}
});

users.getUser('133121ce-c14c-3354-f9b5-be433ab501ca', (err, user) => {
	if (err) {
		console.log(err);
	} else {
		console.log(user);
	}
});

pourHistory.addPour({userId: '133121ce-c14c-3354-f9b5-be433ab501ca', amount: '0.34', beerId: 'macnjack'}, 
	(err, res) => {
		if(err) {
			console.log("error: "+err);
		} else {
			console.log(res);
		}
	}
);

pourHistory.getPoursInPeriod(Date.now()-60*60*60*1000,Date.now(),(err, pours) => {
	if (err) {
		console.log(err);
	} else {
		console.log(pours);
	}
});
