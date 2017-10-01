const Configuration = require('./configuration');

class Solenoid {

	constructor(gpio, pin, safetyLimitMs) {
		this.safetyLimitMs = safetyLimitMs;
		this.gpio = gpio;
		this.gpio.setup(pin, gpio.DIR_OUT);
		this.pin = pin;
		this.safetyTimer = setTimeout(function(){},0);
	}
	
	Open(callback) {
		this.gpio.write(this.pin, true, (err) => {
			clearTimeout(this.safetyTimer);
			this.safetyTimer = setTimeout(() => {this.safetyClose()}, this.safetyLimitMs);
			callback(err);
		});
	}

	Close(callback) {
		this.gpio.write(this.pin, false, (err) => {
			clearTimeout(this.safetyTimer);
			// we want the app to crash if the close fails
			if (err) throw err;
			callback(err);
		});
	}

	safetyClose() {
		this.gpio.write(this.pin, false, (err) => {
			console.log("Closed the solenoid forcefully because the safety timer went off to prevent the solenoid from burning.");
			if (err) throw err;
		});
	}
}

class MockSolenoid {
	Open(callback) {
		console.log("Opened solenoid");
		callback(null);
	}

	Close(callback) {
		console.log("Closed solenoid");
		callback(null);
	}
}

function createSolenoid(params) {
	
	var pin = params.pin ? params.pin : 38;
	var safetyLimitMs = params.safetyLimitMs ? params.safetyLimitMs : 30000
	var gpio = require('rpi-gpio');

	const solenoid = Configuration.MOCK_POURS
		? new MockSolenoid()
		: new Solenoid(gpio, pin, safetyLimitMs);

	return solenoid;
}

module.exports = createSolenoid;