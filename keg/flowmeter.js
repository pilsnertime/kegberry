const EventEmitter = require('events');
const fs = require('fs');
const Configuration = require('./configuration');
class MyEmitter extends EventEmitter {}

function FlowMeter(emitter, pin, litersPerTick, timeBetweenPours, notificationMl) {
	this.pin = pin;
	this.calibrationTickCount = 0;
	this.fakeTickCount = 0;
	this.calibrateMl = 0;
	this.litersPerTick = litersPerTick;
	this.timeBetweenPours = timeBetweenPours;
	this.notificationMl = notificationMl;
	this.emitter = emitter;

	this.timer = setTimeout(function(){},0);
	this.fakePourTimer = setTimeout(function(){},0);

	this.notificationTrack = 0;
	this.litersPoured = 0;

	this.finishPour = () => {
		if (!this.calibrate) {
			this.emitter.emit('finishedPour', this.litersPoured);
		} else {
			if (this.calibrationTickCount > 0)
			{
				this.litersPerTick = this.calibrateMl / 1000 / this.calibrationTickCount;
				this.calibrate = false;
				console.log(`Finished calibration. New litersPerTick: ${this.litersPerTick}`)
			}
			else
			{
				console.log(`Finished calibration with no-op. Keeping litersPerTick: ${this.litersPerTick}`)
			}
			this.emitter.emit('finishedCalibration', this.litersPerTick);
		}		
		this.fakeTickCount = 0;
		this.litersPoured = 0;
		this.notificationTrack = 0;
	}

	this.setup = () => {

		fs.readFile('/proc/cpuinfo', 'utf8', (err, data) => {
			var match;

			if (data != undefined) {
				// Match the last 4 digits of the number following "Revision:"
				var match = data.match(/Revision\s*:\s*[0-9a-f]*([0-9a-f]{4})/);
			}

			if (!match || match.length == 0)
			{
				console.log("Not running on a Raspberry Pi. Enabling a mock pour.");
				if (!Configuration.MOCK_POURS)
					throw "Mock pours is disabled!!";
				this.gpio = new MyEmitter();
			}
			else
			{
				this.gpio = require('rpi-gpio');
				this.gpio.setup(this.pin, this.gpio.DIR_IN, this.gpio.EDGE_BOTH, (err) => {
					if (err) {
						console.log("Encountered error while setting up GPIO pin: " + err);
					}
				});
			}

			this.gpio.on('change', (channel, value) => {
				if (this.calibrate) { this.calibrationTickCount++; }
				this.litersPoured += this.litersPerTick;				
				var notificationCount = Math.floor((this.litersPoured*1000)/notificationMl);
				if (notificationCount > this.notificationTrack) {
					this.notificationTrack = notificationCount;
					if (!this.calibrate) {
						this.emitter.emit('pourUpdate', this.litersPoured);
					}
				}
	
				clearTimeout(this.timer);
				this.timer = setTimeout(this.finishPour, this.timeBetweenPours);
			});
	
			this.emitter.on('calibrate', (milliliters) => {
				this.calibrate = true;
				if (!milliliters) {
					this.calibrateMl = Configuration.CALIBRATION_ML;
				} else {
					this.calibrateMl = milliliters;				
				}
				console.log(`Starting calibration with a ${this.calibrateMl} mL pour. Old liters per tick: ${this.litersPerTick}`);
				this.calibrationTickCount = 0;
				clearTimeout(this.timer);
				this.timer = setTimeout(this.finishPour, Configuration.CALIBRATION_TIMEOUT);
			});

			this.fakePour = () => {
				clearTimeout(this.fakePourTimer);
				this.fakeTickCount++;
				if (this.fakeTickCount <= 0.5/this.litersPerTick + (Math.random()-0.5)*0.05/this.litersPerTick) {
					this.gpio.emit('change', "blah");		
					this.fakePourTimer = setTimeout(this.fakePour, 15);
				}
			}

			this.emitter.on('fakePour', this.fakePour);
		});
	}
}

function createFlowmeter(params) {

	var pin = params.pin ? params.pin : 40;
	var litersPerTick = params.litersPerTick ? params.litersPerTick : 0.00223;
	var timeBetweenPours = params.timeBetweenPours ? params.timeBetweenPours : 3000;
	var notificationMl = params.notificationMl ? params.notificationMl : 50;

	const myEmitter = new MyEmitter();

	const flowMeter = new FlowMeter(myEmitter, pin, litersPerTick, timeBetweenPours, notificationMl);

	flowMeter.setup();

	return myEmitter;
}

module.exports = createFlowmeter;