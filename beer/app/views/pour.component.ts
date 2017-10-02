import { MessagingService, IPourNotification } from './../infrastructure/messaging.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'pour-component',
    templateUrl: './app/views/pour.component.html',
    styleUrls: ['./app/views/pour.component.css']
})

export class Pour {
    private _maxBeerHeight = 220;
    private _progress: number;
    private _currentUserName: string = 'default user';
    foams = Array(7).fill(0).map((x,i) => i);
    bubbles = Array(6).fill(0).map((x, i) => i);

    constructor(private _messageService: MessagingService) { 
        this.progress = 0;
        this._messageService.pourNotificationStream.subscribe((data: IPourNotification) => {
            if (data !== undefined)
            {
                this.progress = (data.totalPour*1000)/5;
                console.log('totalpour' + data.totalPour);
                console.log(this.progress);
                this.currentUserName = data.currentUser.name;

                if (data.isFinished)
                {
                    setTimeout(() => {
                        this.progress = 0;
                        this.currentUserName = 'default user'
                    }, 4000);
                }
            }
        });
    }

    get progress(): number
    {
        return this._progress
    }

    set progress(progress: number)
    {
        this._progress = progress > 100 ? 100 : progress;
    }

    get beerHeightProgress(): number {
        return this._progress * this._maxBeerHeight / 100;
        // return 220;
    }

    get currentUserName(): string
    {
        return this._currentUserName;
    }

    set currentUserName(currentUserName: string)
    {
        this._currentUserName = currentUserName;
    }
}