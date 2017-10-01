var fs = require('fs');
var os = require('os');
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8080 });
var databaseDir = "../kegberrydb";
var userDbFile = databaseDir + "/users.nosql";
var pourDbFile = databaseDir + "/pours.nosql";

// Set up databases if they don't exist
if (!fs.existsSync(databaseDir)){
    fs.mkdirSync(databaseDir);
}
if (!fs.existsSync(userDbFile)){
    fs.writeFileSync(userDbFile, "{\"id\":\"default_user\",\"name\":\"Default User\"}" + os.EOL);
}
if (!fs.existsSync(pourDbFile)){
    fs.writeFileSync(pourDbFile, "{}" + os.EOL);
}

var users = require('./keg/users.js')(userDbFile);
var pours = require('./keg/pours.js')(pourDbFile);

// Spawn an app for temperature reading
var TEMP_POLLING_SEC = 10;
var spawn = require('child_process').spawn,
    weatherProcess = spawn('python', ['./keg/get_temperature.py', TEMP_POLLING_SEC]);

weatherProcess.on('error', (err) => {
  console.log("Couldn't spawn temperature polling. Make sure python is installed.")
});

var flowmeter = require('./keg/flowmeter')({
	pin: 40,
	tickCalibration: 0.00089711713,
	timeBetweenPours: 3000, 
	notificationMl: 10
});

var solenoid = require('./keg/solenoid')({
    pin: 38,
    safetyLimitMs: 30000
});

var messageService = require('./keg/messageService.js')(wss, weatherProcess, flowmeter, solenoid, users, pours);
messageService.Start();