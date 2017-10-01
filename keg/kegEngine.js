const {WeatherNotificationMessage, PourNotificationMessage, AddUserMessage, AddUserResponseMessage, GetUsersResponseMessage, SelectUserResponseMessage} = require('./definitions');

class KegEngine {

    constructor(messageChannel, users, pours)
    {
        this.messageChannel = messageChannel;
        this.users = users;
        this.pours = pours;
    }

    Initialize() {
        this.users.getDefaultUser((err, user) => {
            if (!err) {
                this.currentUser = user;
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
            if(data){
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
            if(litersPoured){
                this.currentPourTotal += litersPoured;
                var notificationMsg = new PourNotificationMessage(this.currentUser, litersPoured, this.currentPourTotal, false);
                if(this.messageChannel.SendMessage(notificationMsg)) {
                    flowmeter.removeListener('pourUpdate', pourCallback);
                }
            }
        };

        var finishedPourCallback = (litersPoured) => {
            if(litersPoured){
                this.currentPourTotal += litersPoured;
                this.pours.addPour({userId: this.currentUser.id, beerId: "shocktop", amount: this.currentPourTotal}, (err, res) => {
                    if (err || !res) {
                        console.log("Failed to preserve pour. Error: " + err);
                    }
                    var notificationMsg = new PourNotificationMessage(this.currentUser, litersPoured, this.currentPourTotal, true);
                    
                    this.currentPourTotal = 0;
                    if(this.messageChannel.SendMessage(notificationMsg)) {
                        flowmeter.removeListener('finishedPour', finishedPourCallback);
                    }
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
                }
                var responseMsg = new SelectUserResponseMessage(err, this.currentUser);
                this.messageChannel.SendMessage(responseMsg);
            });
        }
    }
}

module.exports = KegEngine;