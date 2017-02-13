import { IMessage, ITemperatureMessage } from './messaging.service';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AmbianceStats } from './kegStats.component';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Subject} from "rxjs/Rx";

@Injectable()
export class MessagingService {
    private _url = 'ws://kegberry:8080';
    private socket;

    // message streams
    private temperatureMessageName: string = 'temperature';
    private _temperatureMessage: Subject<ITemperatureMessage> = new Subject<ITemperatureMessage>();
    public temperatureMessageStream: Observable<ITemperatureMessage> = this._temperatureMessage.asObservable();

    constructor() {
        this.connectToSocket();
    }

    connectToSocket(): void {
        this.socket = new WebSocket(this._url);
        // Open the socket
        this.socket.onopen = (onOpenEvent) => {
            
            // Send an initial message
            // socket.send('I am the client and I\'m listening!');
            
            // Listen for messages
            this.socket.onmessage = (onMessageEvent: IMessage) => {
                console.log('Client received a message', onMessageEvent);
                this.processMessage(onMessageEvent.data)
            };
            
            // Listen for socket closes
            this.socket.onclose = (onCloseEvent) => {
                console.log('Client notified socket has closed',onCloseEvent);
            };
            
        };
    }

    processMessage(msg: string): void {
        let message: IMessage;
        try {
            message = JSON.parse(msg);
        } catch (e) {
            console.log('Error parsing message:' + e);
        }

        switch(message.type) {
            case this.temperatureMessageName:
                this._temperatureMessage.next(message.data);
            break;
            default:
                console.log('Message type not supported: ' + message.type);
            break;
        }
    }
}

export interface IMessage {
    type: string;
    data: any;
}

export interface ITemperatureMessage {
    temperature: number;
    humidity: number;
}