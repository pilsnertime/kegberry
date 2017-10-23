const EventEmitter = require('events');
const fs = require('fs');
const Configuration = require('./configuration');
class MyEmitter extends EventEmitter {}

function FlowMeter(emitter, pin, tickCalibration, timeBetweenPours, notificationMl) {
	var self = this;
	this.gpio = require('rpi-gpio');
	this.pin = pin;
	this.tickCount = 0;
	this.calibrateMl = 0;
	this.tickCalibration = tickCalibration;
	this.timeBetweenPours = timeBetweenPours;
	this.notificationMl = notificationMl;
	this.emitter = emitter;

	this.timer = setTimeout(function(){},0);

	this.notificationTrack = 0;
	this.litersPoured = 0;

	this.finishPour = function() {
		if (!self.calibrate) {
			self.emitter.emit('finishedPour', self.litersPoured);
		} else {
			console.log(self.tickCount);
			console.log(self.calibrateMl);			
			self.tickCalibration = self.calibrateMl / self.tickCount;
			self.calibrate = false;
			self.emitter.emit('finishedCalibration', self.tickCalibration);
		}
		self.litersPoured = 0;
		self.notificationTrack = 0;
	}

	this.setup = function() {

		fs.readFile('/proc/cpuinfo', 'utf8', (err, data) => {
			// Match the last 4 digits of the number following "Revision:"
			var match = data.match(/Revision\s*:\s*[0-9a-f]*([0-9a-f]{4})/);

			if (!match || match.length == 0)
			{
				console.log("Not running on a Raspberry Pi. Please enable the mock flowmeter to test functionality.");
			}
			else
			{
				this.gpio.setup(self.pin, self.gpio.DIR_IN, self.gpio.EDGE_BOTH, function(err) {
					if (err) {
						console.log("Encountered error while setting up GPIO pin: " + err);
					}
				});
			}
		});

		this.gpio.on('change', function(channel, value) {
			console.log("::"+self.tickCount);
			self.tickCount++;
			self.litersPoured += self.tickCalibration;
			
			if(Math.floor((self.litersPoured*1000)/notificationMl) > self.notificationTrack) {
				self.notificationTrack = Math.floor(self.litersPoured*1000/self.notificationMl);
				if (!self.calibrate) {
					self.emitter.emit('pourUpdate', self.litersPoured);
				}
			}

			clearTimeout(self.timer);
		    self.timer = setTimeout(self.finishPour, self.timeBetweenPours);
		});

		this.emitter.on('calibrate', (milliliters) => {
			console.log("calibrate1");
			self.calibrate = true;
			if (!milliliters) {
				self.calibrateMl = Configuration.CALIBRATION_ML;
			} else {
				self.calibrateMl = milliliters;				
			}
			console.log(self.calibrateMl);
			self.tickCount = 0;
		})
	}
}

function MockFlowMeter(emitter, notificationMl) {
	this.updateMs = notificationMl/50*1000;
	this.notificationMl = notificationMl;
	this.count = 0;
	this.emitter = emitter;
	this.pourUpdate = () => {
		this.count++;
		if (this.count <= 500/this.notificationMl) {
			this.emitter.emit('pourUpdate', this.notificationMl/1000);		
			setTimeout(this.pourUpdate, this.updateMs);
		} else {
			this.finishPour();
		}
	}

	this.finishPour = () => {
		this.emitter.emit('finishedPour', this.notificationMl/1000);
		this.count = 0;
	}

	this.setup = () => {
		this.emitter.on('fakePour', this.pourUpdate);
	}
}

function createFlowmeter(params) {

	var pin = params.pin ? params.pin : 40;
	var tickCalibration = params.tickCalibration ? params.tickCalibration : 0.00223;
	var timeBetweenPours = params.timeBetweenPours ? params.timeBetweenPours : 3000;
	var notificationMl = params.notificationMl ? params.notificationMl : 50;

	const myEmitter = new MyEmitter();

	const flowMeter = Configuration.MOCK_POURS
		? new MockFlowMeter(myEmitter, notificationMl)
		: new FlowMeter(myEmitter, pin, tickCalibration, timeBetweenPours, notificationMl);

	flowMeter.setup();

	return myEmitter;
}

module.exports = createFlowmeter;