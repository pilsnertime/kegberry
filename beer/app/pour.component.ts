import { MessagingService, IPourNotification } from './messaging.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'pour-component',
    templateUrl: './app/pour.component.html',
    styleUrls: ['./app/pour.component.css']
})
export class Pour {
    private _progress: number;
    private _currentUserName: string = 'default user';
    constructor(private _messageService: MessagingService) { 
        this.progress = 0;
        this._messageService.pourNotificationStream.subscribe((data: IPourNotification) => {
            if (data !== undefined)
            {
                this.progress = ((data.totalPour*1000)/5);
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
        this._progress = progress;
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