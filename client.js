var flowmeter = require('./flowmeter')({
	pin: 40,
	tickCalibration: 0.00223,
	timeBetweenPours: 3000
});

flowmeter.on('finishedPour', function(data){
	console.log("Done pouring bitch: " + data);
});