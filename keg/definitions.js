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

class CalibrationResponseMessage extends ResponseMessage
{
    constructor(tickCalibrationMl)
    {
        super("calibrationResponse", null, {
            tickCalibrationMl: tickCalibrationMl
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
    constructor(err, user)
    {
        super("addUserResponse", err, !user?undefined:{user: user});
    }
}

class GetUsersResponseMessage extends ResponseMessage
{
    constructor(err, users)
    {
        super("getUsersResponse", err, !users?undefined:{users: users});
    }
}

class SelectUserResponseMessage extends ResponseMessage
{
    constructor(err, user)
    {
        super("selectUserResponse", err, !user?undefined:{user: user});
    }
}

class CurrentUserNotificationMessage extends ResponseMessage
{
    constructor(err, user)
    {
        super("currentUser", err, !user?undefined:{user: user});
    }
}

class BadRequestResponseMessage extends ResponseMessage
{
    constructor(message)
    {
        super("failedResponse", message)
    }
}

module.exports = {
    ClientMessage: ClientMessage,
    ResponseMessage: ResponseMessage,
    WeatherNotificationMessage: WeatherNotificationMessage,
    PourNotificationMessage: PourNotificationMessage,
    AddUserMessage: AddUserMessage,
    AddUserResponseMessage: AddUserResponseMessage,
    GetUsersResponseMessage: GetUsersResponseMessage,
    SelectUserResponseMessage: SelectUserResponseMessage,
    CurrentUserNotificationMessage: CurrentUserNotificationMessage,
    BadRequestResponseMessage: BadRequestResponseMessage,
    CalibrationResponseMessage: CalibrationResponseMessage
};