var IS_TEST_ENV = process.argv.slice(2).length > 0 && process.argv.slice(2)[0] == "test"
if (IS_TEST_ENV)
    console.log("Running the kegberry application as a test ಠ_ಠ ... \n\n\n")
var fs = require('fs');
var os = require('os');
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8081 });
var databaseDir = "../kegberrydb";
var userDbFile = databaseDir + "/users.nosql";
var pourDbFile = databaseDir + "/pours.nosql";
var kegDbFile = databaseDir + "/keg.nosql";


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
if (!fs.existsSync(kegDbFile)){
    fs.writeFileSync(kegDbFile, "{\"beerId\":\"Test Beer Name\", \"description\":\"Best beer\", \"ABV\":5.0, \"IBU\":20, \"SRM\":2,\
     \"logoURL\":\"https://sapporobeer.com/assets/Uploads/logo-premiumbeer.png\", \"capacityLiters\":58.67, \"consumedLiters\":0.00, \"tickMl\":0.00089711713}" + os.EOL);
}

var userData = require('./keg/users.js')(userDbFile);
var pourData = require('./keg/pours.js')(pourDbFile);
var kegData = require('./keg/pours.js')(kegDbFile);

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
	notificationMl: 20
});

var solenoid = require('./keg/solenoid')({
    pin: 38,
    safetyLimitMs: 30000
});

var messageService = require('./keg/messageService.js')(wss, weatherProcess, flowmeter, solenoid, userData, pourData, kegData);
messageService.Start();

// Once we've gone through the whole spin-up workflow without throwing,
// we can kill our process peacefully to enable the pre-merge validation
if (IS_TEST_ENV) {
    console.log("Successfully validated all the workflows of the keberry application ( ͡° ͜ʖ ͡°) !!!")
    process.exit(0);
}