const {WeatherNotificationMessage, PourNotificationMessage, AddUserMessage, AddUserResponseMessage, GetUsersResponseMessage, SelectUserResponseMessage, CurrentUserNotificationMessage} = require('./definitions');
const Configuration = require('./configuration');

class KegEngine {

    constructor(messageChannel, solenoid, users, pours)
    {
        this.messageChannel = messageChannel;
        this.solenoid = solenoid;
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
    HandlePours(flowmeter) {
        
        var pourCallback = (litersPoured) => {
            if (litersPoured){
                this.currentPourTotal += litersPoured;

                //reset the user timer because pouring is a sign of activity
                clearTimeout(this.userTimer);
                this.userTimer = setTimeout(() => {this.DefaultUserNotification()}, Configuration.USER_TIMEOUT);

                var notificationMsg = new PourNotificationMessage(this.currentUser, litersPoured, this.currentPourTotal, false);
                if (this.messageChannel.SendMessage(notificationMsg)) {
                    flowmeter.removeListener('pourUpdate', pourCallback);
                }
            }
        };

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
                            flowmeter.removeListener('finishedPour', finishedPourCallback);
                        }
                    });
                });
            }
        };

        flowmeter.on('pourUpdate', pourCallback);

        flowmeter.on('finishedPour', finishedPourCallback);
    };

    FakePour(flowmeter){
        flowmeter.emit("fakePour");
    }

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