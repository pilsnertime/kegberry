const {CalibrationResponseMessage, PourNotificationMessage, AddUserMessage, AddUserResponseMessage, GetUsersResponseMessage, SelectUserResponseMessage, RemoveUserResponseMessage, GetLastPoursResponseMessage, CurrentUserNotificationMessage, OperationInProgressErrorMessage} = require('./definitions');
const Configuration = require('./configuration');
var AsyncLock = require('async-lock');

class KegEngine {

    constructor(solenoid, flowmeter, users, pours)
    {
        this.solenoid = solenoid;
        this.flowmeter = flowmeter;
        this.users = users;
        this.pours = pours;
        this.userTimer = setTimeout(function(){},0);
        this.solenoidLock = new AsyncLock();
        this._solenoidInUse = false;
    }

    Initialize(broadcast) {
        this.users.getDefaultUser((err, defaultUser) => {
            if (!err) {
                this.currentUser = defaultUser;
                this.defaultUser = defaultUser;
            } else {
                console.log("Error while getting the default user: " + err);
            }
        });

        this.lastPourUpdateLiters = 0;
        this.HandlePours(broadcast)
    }

    _tryLockSolenoid(cb)
    {
        this.solenoidLock.acquire("lock", (done) => {
            if (this._solenoidInUse)
            {
                cb(false);
            }
            else
            {
                this._solenoidInUse = true;
                cb(true);
            }
            done();
        });
    };

    _unlockSolenoid(cb)
    {
        this.solenoidLock.acquire("lock", (done) => {
            this._solenoidInUse = false;
            if (cb) cb();
            done();
        });
    };

    _tryEnterExclusiveOperation(personal, cb)
    {
        this._tryLockSolenoid((success) => {
            if (!success)
            {
                personal(new OperationInProgressErrorMessage());
            }
            cb(success);
        });
    };

    ///////////////////
    // POURS
    ///////////////////
    HandlePours(broadcast) {

        var pourCallback = (litersPoured) => {
            if (litersPoured){
                //reset the user timer because pouring is a sign of activity
                clearTimeout(this.userTimer);
                this.userTimer = setTimeout(() => {this.DefaultUserNotification(broadcast)}, Configuration.USER_TIMEOUT);

                var notificationMsg = new PourNotificationMessage(this.currentUser, litersPoured - this.lastPourUpdateLiters, litersPoured, false);
                this.lastPourUpdateLiters = litersPoured;
                broadcast(notificationMsg);
            }
        };

        var calibrationCallback = (litersPerTick) => {
            var calibrationMessage = new CalibrationResponseMessage(litersPerTick);
            broadcast(calibrationMessage);
        }

        var finishedPourCallback = (litersPoured) => {
            if (litersPoured && litersPoured > this.flowmeter.litersPerTick * 4){
                this.pours.addPour({userId: this.currentUser.id, beerId: "serengeti", amount: litersPoured}, (err, res) => {
                    if (err || !res) {
                        console.log("Failed to preserve pour. Error: " + err);
                    }

                    var notificationMsg = new PourNotificationMessage(this.currentUser, litersPoured - this.lastPourUpdateLiters, litersPoured, true);
                    this.lastPourUpdateLiters = 0;
                    broadcast(notificationMsg);
                });
            }
        };

        this.flowmeter.on('pourUpdate', pourCallback);

        this.flowmeter.on('finishedCalibration', calibrationCallback);        

        this.flowmeter.on('finishedPour', finishedPourCallback);
    };

    GetLastPours(parsedMsg, broadcast, personal) {
        this.pours.getLastPours(parsedMsg.data ? parsedMsg.data.top : 100, (err, pours) => {
            var responseMsg = new GetLastPoursResponseMessage(err, pours);
            personal(responseMsg);
        });
    };

    Calibrate(parsedMsg, broadcast, personal){
        this._tryEnterExclusiveOperation(personal, (success) => {
            if (success)
            {
                this.flowmeter.emit("calibrate");

                this.solenoid.Open((err) => {
                    clearTimeout(this.userTimer);
                    this.userTimer = setTimeout(() => {this.DefaultUserNotification(null, personal)}, Configuration.CALIBRATION_TIMEOUT);
                });
            }
        });
    }

    FakePour(parsedMsg, broadcast, personal){
        this.flowmeter.emit("fakePour");     
    };

    ///////////////////
    // USERS
    ///////////////////
    AddUser(parsedMsg, broadcast, personal) {
        this.users.addUser(new AddUserMessage(parsedMsg), (err, guid) => {
            var responseMsg = new AddUserResponseMessage(err, guid);
            if (err) { 
                personal(responseMsg); 
            } else {
                broadcast(responseMsg);
            }
        });
    }

    GetUsers(parsedMsg, broadcast, personal) {
        this.users.getUsers((err, users) => {
            var responseMsg = new GetUsersResponseMessage(err, users);
            personal(responseMsg);
        });
    }

    RemoveUser(parsedMsg, broadcast, personal) {
        if (!parsedMsg.data || !parsedMsg.data.id) {
            personal(new RemoveUserResponseMessage("Expected data member 'id' is missing from the request", null)); 
        } else {
            this.users.removeUser(parsedMsg.data.id, (err, count) => {
                var responseMsg = new RemoveUserResponseMessage(err, count);
                broadcast(responseMsg);
            });
        }
    }

    SelectUser(parsedMsg, broadcast, personal) {
        if (!parsedMsg.data || !parsedMsg.data.id) {
            personal(new SelectUserResponseMessage("Expected data member 'id' is missing from the request", null)); 
        } else {
            this.users.getUser(parsedMsg.data.id, (err, user) => {
                if (!err) {
                    this._tryEnterExclusiveOperation(personal, (success) => {
                        if (success)
                        {
                            this.currentUser = user;
                            this.solenoid.Open((err) => {
                                var responseMsg = new SelectUserResponseMessage(err, this.currentUser);
                                personal(responseMsg);
                                clearTimeout(this.userTimer);
                                this.userTimer = setTimeout(() => {this.DefaultUserNotification(null, personal)}, Configuration.USER_TIMEOUT);
                            });
                        }
                    });
                } else {
                    var responseMsg = new SelectUserResponseMessage(err, this.currentUser);
                    personal(responseMsg);
                }                
            });
        }
    }

    DefaultUserNotification(broadcast, personal) {
        this.currentUser = this.defaultUser;
        this.solenoid.Close((err) => {
            clearTimeout(this.userTimer);
            var responseMsg = new CurrentUserNotificationMessage(err, this.currentUser);
            if (broadcast)
            {
                broadcast(responseMsg);
            }
            else
            {
                personal(responseMsg);
            }
            this._unlockSolenoid();        
        });
    }
}

module.exports = KegEngine;
