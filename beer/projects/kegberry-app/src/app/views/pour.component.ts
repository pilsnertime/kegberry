import { MessagingService, IPourNotification } from './../infrastructure/messaging.service';
import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'pour',
    templateUrl: 'pour.component.html',
    styleUrls: ['pour.component.css']
})

export class Pour {
    private _maxBeerHeight = 220;
    private _progress: number;
    private _currentUserName: string = 'default user';
    foams = Array(7).fill(0).map((x,i) => i);
    bubbles = Array(6).fill(0).map((x, i) => i);

    @Output() pourFinished = new EventEmitter();

    constructor(private _messageService: MessagingService) { 
        this.progress = 0;
        this._messageService.pourNotificationStream.subscribe((data: IPourNotification) => {
            if (data !== undefined)
            {
                this.progress = (data.totalPour*1200)/5;
                console.log('totalpour' + data.totalPour);
                console.log(this.progress);
                this.currentUserName = data.currentUser.name;

                if (data.isFinished)
                {
                    setTimeout(() => {
                        this.progress = 0;
                        this.currentUserName = 'default user'
                        this.pourFinished.emit();
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