import { IMessage, ITemperatureNotification, IGetUserResponse, IPourNotification } from './messaging.service';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AmbianceStats } from './../views/kegStats.component';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Subject, Observable, BehaviorSubject} from "rxjs/Rx";

@Injectable()
export class MessagingService {
    private _url = 'ws://kegberry:8080';
    private socket: WebSocket;

    private _onConnected: Subject<any> = new Subject<any>();
    public readyStream: Observable<any> = this._onConnected.asObservable();

    private _onClosed: Subject<any> = new Subject<any>();
    public closedStream: Observable<any> = this._onClosed.asObservable();

    // message names to server
    // todo: refactor message names to a stand alone class/interface/
    public GetUsers: string = 'getUsers';
    public AddUser: string = 'addUser';
    public SelectUser: string = 'selectUser';

    // message streams
    private pourNotification: string = 'pourUpdate';
    private _pourNotification: Subject<IPourNotification> = new Subject<IPourNotification>();
    public pourNotificationStream: Observable<IPourNotification> = this._pourNotification.asObservable();
    private temperatureNotification: string = 'weather';
    private _temperatureMessage: Subject<ITemperatureNotification> = new Subject<ITemperatureNotification>();
    public temperatureMessageStream: Observable<ITemperatureNotification> = this._temperatureMessage.asObservable();

    private getUsersResponse: string = 'getUsersResponse';
    private _getUsersResponse: BehaviorSubject<IGetUserResponse> = new BehaviorSubject<IGetUserResponse>(undefined);
    public getUsersResponseStream: Observable<IGetUserResponse> = this._getUsersResponse.asObservable().filter(res => !!res);
    private addUserResponse: string = 'addUserResponse';
    private _addUserResponseStream: Subject<IAddUserResponse> = new Subject<IAddUserResponse>();
    public addUserResponseStream: Observable<IAddUserResponse> = this._addUserResponseStream.asObservable();

    constructor() {
        this.connectToSocket();
    }

    connectToSocket(): void {
        this.socket = new WebSocket(this._url);
        // Open the socket
        this.socket.onopen = (onOpenEvent) => {
            
            this._onConnected.next(undefined);
            // Send an initial message
            // socket.send('I am the client and I\'m listening!');
            
            // Listen for messages
            this.socket.onmessage = (onMessageEvent) => {
                console.log('Client received a message', onMessageEvent);
                this.processMessage(onMessageEvent.data)
            };

            // Listen for socket closes
            this.socket.onclose = (onCloseEvent) => {
                this._onClosed.next(undefined)
                console.log('Client notified socket has closed',onCloseEvent);
            };
        };
    }

    processMessage(msg: string): void {
        let message: IResponseMessage;
        try {
            message = JSON.parse(msg);
        } catch (e) {
            console.log('Error parsing message:' + e);
        }

        switch(message.messageName) {
            // notifications
            case this.temperatureNotification:
                this._temperatureMessage.next(message.data);
            break;
            case this.pourNotification:
                this._pourNotification.next(message.data);
            break;

            // responses
            case this.getUsersResponse:
                this._getUsersResponse.next(message.data);
            break;
            case this.addUserResponse:
                this._addUserResponseStream.next(message.data);
            break;
            default:
                console.log('Message notification not supported: ' + message.messageName);
            break;
        }
    }

    sendMessage(msg: IMessage) {
        console.log(msg);
        this.socket.send(JSON.stringify(msg));
    }
}

export interface IMessage {
    messageName: string;
    data: any;
}

export interface ITemperatureNotification {
    temperature: number;
    humidity: number;
}

export interface IAddUserMessageData {
    name: string;
}

export interface IAddUserMessage{
    name: string;
}

export interface IGetUserResponse {
    users: IUser[];
}

export interface IAddUserResponse extends IUser {
}

export interface ISelectUserData {
    id: string;
}

export interface IUser {
    name: string;
    id: string;
}

export interface IResponseMessage extends IMessage {
    error: string;
}

export interface IPourNotification {
    currentUser: IUser;
    incrementalPour: number;
    totalPour: number;
    isFinished: boolean;
}
