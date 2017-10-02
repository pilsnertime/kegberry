import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {BehaviorSubject} from "rxjs/Rx";

@Injectable()
export class SocketService {
    private _url = 'ws://localhost:8080';
    private socket;
    private _temperature: BehaviorSubject<any> = new BehaviorSubject(undefined);
    public temperature: Observable<Array<String>> = this._temperature.asObservable();

    constructor() {
        this.socket = new WebSocket(this._url);
        let self = this;
        // Open the socket
        this.socket.onopen = (onOpenEvent) => {
            
            // Send an initial message
            // socket.send('I am the client and I\'m listening!');
            
            // Listen for messages
            self.socket.onmessage = (onMessageEvent) => {
                console.log('Client received a message', onMessageEvent);
                this._temperature.next(onMessageEvent.data);
            };
            
            // Listen for socket closes
            self.socket.onclose = (onCloseEvent) => {
                console.log('Client notified socket has closed',onCloseEvent);
            };
            
        };
    }
}