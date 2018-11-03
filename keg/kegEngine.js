const {WeatherNotificationMessage, CalibrationResponseMessage, PourNotificationMessage, AddUserMessage, AddUserResponseMessage, GetUsersResponseMessage, SelectUserResponseMessage, GetLastPoursResponseMessage, CurrentUserNotificationMessage} = require('./definitions');
const Configuration = require('./configuration');

class KegEngine {

    constructor(messageChannel, solenoid, flowmeter, users, pours)
    {
        this.messageChannel = messageChannel;
        this.solenoid = solenoid;
        this.flowmeter = flowmeter;
        this.users = users;
        this.pours = pours;
        this.userTimer = setTimeout(function(){},0);
    }

    Initialize() {
        this.users.getDefaultUser((err, defaultUser) => {
            if (!err) {
                this.currentUser = defaultUser;
                this.defaultUser = defaultUser;
            } else {
                console.log("Error while getting the default user: " + err);
            }
        });

        this.currentPourTotal = 0;
    }

    ///////////////////
    // WEATHER
    ///////////////////
    HandleWeather(weatherChannel) {
        
        var weatherCallback = (data) => {
            if (data){
                var outData = JSON.parse(data);
                var notificationMsg = new WeatherNotificationMessage(outData.error, outData.data);
                if (this.messageChannel.SendMessage(notificationMsg)) {
                    weatherChannel.removeListener('data', weatherCallback);
                }
            }    
        };
        
        weatherChannel.on('data', weatherCallback);
    };

    ///////////////////
    // POURS
    ///////////////////
    HandlePours() {

        var pourCallback = (litersPoured) => {
            if (litersPoured){
                this.currentPourTotal += litersPoured;

                //reset the user timer because pouring is a sign of activity
                clearTimeout(this.userTimer);
                this.userTimer = setTimeout(() => {this.DefaultUserNotification()}, Configuration.USER_TIMEOUT);

                var notificationMsg = new PourNotificationMessage(this.currentUser, litersPoured, this.currentPourTotal, false);
                if (this.messageChannel.SendMessage(notificationMsg)) {
                    this.flowmeter.removeListener('pourUpdate', pourCallback);
                }
            }
        };

        var calibrationCallback = (tickCalibration) => {
            var calibrationMessage = new CalibrationResponseMessage(tickCalibration);
            if (this.messageChannel.SendMessage(calibrationMessage)) {
                this.flowmeter.removeListener('finishedCalibration', calibrationCallback);
            }
        }

        var finishedPourCallback = (litersPoured) => {
            if (litersPoured){
                this.currentPourTotal += litersPoured;
                this.pours.addPour({userId: this.currentUser.id, beerId: "shocktop", amount: this.currentPourTotal}, (err, res) => {
                    if (err || !res) {
                        console.log("Failed to preserve pour. Error: " + err);
                    }                    
                    
                    this.currentPourTotal = 0;
                    this.currentUser = this.defaultUser;
                    var notificationMsg = new PourNotificationMessage(this.currentUser, litersPoured, this.currentPourTotal, true);
                    this.solenoid.Close((err) => {
                        clearTimeout(this.userTimer);
                        if (this.messageChannel.SendMessage(notificationMsg)) {
                            this.flowmeter.removeListener('finishedPour', finishedPourCallback);
                        }
                    });
                });
            }
        };

        this.flowmeter.on('pourUpdate', pourCallback);

        this.flowmeter.on('finishedCalibration', calibrationCallback);        

        this.flowmeter.on('finishedPour', finishedPourCallback);
    };

    GetLastPours(parsedMsg) {
        this.pours.getLastPours(parsedMsg.data ? parsedMsg.data.top : 100, (err, pours) => {
            var responseMsg = new GetLastPoursResponseMessage(err, pours);
            this.messageChannel.SendMessage(responseMsg);
        });
    };

    Calibrate(){
        this.flowmeter.emit("calibrate");

        this.solenoid.Open((err) => {
            clearTimeout(this.userTimer);
            this.userTimer = setTimeout(() => {this.DefaultUserNotification()}, Configuration.USER_TIMEOUT);
        });        
    }

    FakePour(){
        this.flowmeter.emit("fakePour");
    };

    ///////////////////
    // USERS
    ///////////////////
    AddUser(parsedMsg) {
        this.users.addUser(new AddUserMessage(parsedMsg), (err, guid) => {
            var responseMsg = new AddUserResponseMessage(err, guid);
            this.messageChannel.SendMessage(responseMsg);
        });
    }

    GetUsers(parsedMsg) {
        this.users.getUsers((err, users) => {
            var responseMsg = new GetUsersResponseMessage(err, users);
            this.messageChannel.SendMessage(responseMsg);
        });
    }

    SelectUser(parsedMsg) {
        if (!parsedMsg.data || !parsedMsg.data.id) {
            this.messageChannel.SendMessage(new SelectUserResponseMessage("Expected data member 'id' is missing from the request", null)); 
        } else {
            this.users.getUser(parsedMsg.data.id, (err, user) => {
                if (!err) {
                    this.currentUser = user;
                    this.solenoid.Open((err) => {
                        var responseMsg = new SelectUserResponseMessage(err, this.currentUser);
                        this.messageChannel.SendMessage(responseMsg);
                        clearTimeout(this.userTimer);
                        this.userTimer = setTimeout(() => {this.DefaultUserNotification()}, Configuration.USER_TIMEOUT);
                    });
                } else {
                    var responseMsg = new SelectUserResponseMessage(err, this.currentUser);
                    this.messageChannel.SendMessage(responseMsg);
                }                
            });
        }
    }

    DefaultUserNotification() {
        this.currentUser = this.defaultUser;
        this.solenoid.Close((err) => {
            var responseMsg = new CurrentUserNotificationMessage(err, this.currentUser);
            this.messageChannel.SendMessage(responseMsg);
        });
    }
}

module.exports = KegEngine;