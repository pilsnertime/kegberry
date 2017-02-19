class ClientMessage 
{
    constructor(msg)
    {
        this.messageName = msg.name;
        this.data = msg.data;
    }
}

class ResponseMessage
{
    constructor(name, err, data)
    {
        this.messageName = name;
        this.error = err;
        this.data = data;
    }
}

class WeatherNotificationMessage extends ResponseMessage
{
    constructor(err, weatherData)
    {
        super("weather", err, weatherData);
    }
}

class PourNotificationMessage extends ResponseMessage
{
    constructor(currentUser, litersPoured, totalPour, finishedPour)
    {
        super("pourUpdate", null, {
            currentUser: currentUser,
            incrementalPour: litersPoured,
            totalPour: totalPour,
            isFinished: finishedPour
        });
    }
}

class AddUserMessage extends ClientMessage
{
    constructor(msg)
    {
        super(msg);
        if (msg.data) {
            this.userName = msg.data.name;
        }
    }
}

class AddUserResponseMessage extends ResponseMessage
{
    constructor(err, guid)
    {
        super("addUserReponse", err, {guid: guid});
    }
}

class GetUsersResponseMessage extends ResponseMessage
{
    constructor(err, users)
    {
        super("getUsersResponse", err, {users: users});
    }
}

class SelectUserResponseMessage extends ResponseMessage
{
    constructor(err, user)
    {
        super("selectUserResponse", err, {user: user});
    }
}

class BadRequestResponseMessage extends ResponseMessage
{
    constructor(message)
    {
        super("failedResponse", message)
    }
}

function MessageService(app)
{
    this.users = app.get("users");
    this.app = app;

    this.initialize = () => {
        this.users.getDefaultUser((err, user) => {
            if (!err) {
                this.app.set("currentUser", user);
            } else {
                console.log("Error while getting the default user: " + err);
            }
        });

        this.app.set("currentPourTotal", 0);
    }

    this.sendMessage = (responseMsg, ws) => {
        try {
            ws.send(JSON.stringify(responseMsg));
        } catch (e) {
            if (e.message == "not opened") {
                console.log("Socket connection closed before message could be sent..");
                return true;
            } else {            
                console.log("Error sending data through ws: " + e.message);
            }
        }
        return false;
    };

    this.process = (msg, ws) => {

        var parsedMsg;
        try 
        {
            parsedMsg = JSON.parse(msg);
        } 
        catch (e)
        {
            responseMsg = new BadRequestResponseMessage("Failed to parse message: " + e.message);
            this.sendMessage(responseMsg, ws);
            return;
        } 

        if (parsedMsg && !parsedMsg.messageName){
            responseMsg = new BadRequestResponseMessage("All messages must contain a 'messageName' property");
            this.sendMessage(responseMsg, ws);
            return;
        }

        switch(parsedMsg.messageName)
        {
            case "addUser":
                this.users.addUser(new AddUserMessage(parsedMsg), (err, guid) => {
                    responseMsg = new AddUserResponseMessage(err, guid);
                    this.sendMessage(responseMsg, ws);
                });
                break;

            case "getUsers":
                this.users.getUsers((err, users) => {
                    responseMsg = new GetUsersResponseMessage(err, users);
                    this.sendMessage(responseMsg, ws);
                });
                break;

            case "selectUser":
                this.users.getUser(parsedMsg.data.id, (err, user) => {
                    if (!err) {
                        this.app.set("currentUser",user);
                    }
                    responseMsg = new SelectUserResponseMessage(err, this.app.get("currentUser"));
                    this.sendMessage(responseMsg, ws);
                });
                break;

            default:
                responseMsg = new BadRequestResponseMessage("Unknown operation '" + parsedMsg.name + "'");
                this.sendMessage(responseMsg, ws);
        }
    };

    this.weatherUpdate = (channel, ws) => {

        var weatherCallback = (data) => {
            if(data){
                var outData = JSON.parse(data);
                var notificationMsg = new WeatherNotificationMessage(outData.error, outData.data);
                if (this.sendMessage(notificationMsg, ws)) {
                    channel.removeListener('data', weatherCallback);
                }
            }    
        };
        
        channel.on('data', weatherCallback);
    };

    this.pourUpdate = (flowmeter, ws) => {

        var pourCallback = (litersPoured) => {
            if(litersPoured){
                this.app.set("currentPourTotal", this.app.get("currentPourTotal") + litersPoured);
                var notificationMsg = new PourNotificationMessage(this.app.get("currentUser"), litersPoured, this.app.get("currentPourTotal"), false);
                if(this.sendMessage(notificationMsg, ws)) {
                    flowmeter.removeListener('pourUpdate', pourCallback);
                }
            }
        };

        var finishedPourCallback = (litersPoured) => {
            if(litersPoured){
                var notificationMsg = new PourNotificationMessage(this.app.get("currentUser"), litersPoured, this.app.get("currentPourTotal") + litersPoured, true);
                this.app.set("currentPourTotal", 0);
                if(this.sendMessage(notificationMsg, ws)) {
                    flowmeter.removeListener('finishedPour', finishedPourCallback);
                }
            }
        };

        flowmeter.on('pourUpdate', pourCallback);

        flowmeter.on('finishedPour', finishedPourCallback);
    };
}

function ExposeMessageService(app)
{
    var messageService = new MessageService(app);
    messageService.initialize();
    return messageService;
}

module.exports = ExposeMessageService;