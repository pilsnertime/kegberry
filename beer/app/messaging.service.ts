import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AmbianceStats } from './kegStats.component';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {BehaviorSubject} from "rxjs/Rx";

@Injectable()
export class MessagingService {
    private _url = 'ws://kegberry:8080';
    private socket;

    // message streams
    private temperatureMessageName: string = 'temperature';
    private _temperatureMessage: BehaviorSubject<ITemperatureMessage> = new BehaviorSubject(undefined);
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
            this.socket.onmessage = (onMessageEvent) => {
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
        let parsedMessage: IMessage;
        try {
            parsedMessage = JSON.parse(msg);
        } catch (e) {
            console.log('Error parsing message:' + e);
        }

        switch(parsedMessage.type) {
            case this.temperatureMessageName:
                this._temperatureMessage.next(parsedMessage.data);
            break;
            default:
                console.log('Message type not supported: ' + parsedMessage.type);
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
    humity: number;
}