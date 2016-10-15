import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AmbianceStats } from './kegStats.component';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class Socket {
    private _url = 'ws://kegberry:8080';
    private socket;
     constructor(private http: Http) {}

     sendMessage(message) { 
         this.socket.emit('add-message', message);
     }
    getMessages() {
        let observable = new Observable(observer => {
        this.socket = io(this._url);
            this.socket.on('message', (data) => {
            observer.next(data);    
        });
        return () => {
            this.socket.disconnect();
            };  
        }) 

        return observable;
  }  
}