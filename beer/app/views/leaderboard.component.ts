import { Component } from '@angular/core';
import { IPourer, MessagingService, IGetLeaderboardResponse } from '../infrastructure/messaging.service';
import { ReplaySubject } from 'rxjs/ReplaySubject';

interface IPourWithPXWidth extends IPourer {
    width: number;
}

@Component({
    selector: 'leaderboard',
    templateUrl: './app/views/leaderboard.component.html',
    styleUrls: ['./app/views/leaderboard.component.css']
})
export class LeaderboardComponent {
    private _leaderboardUsersStream = new ReplaySubject<IPourer[]>(1);
    private _maxScoreStream = 1000;

    leaderboardUserStreamWithPixelWidth;


    private _leaderboardUsersMock: IPourer[] = [
        {
            userId: "asdfasdf",
            amount: 1200,
            userName: "Tomas"
        },
        {
            userId: "asdfasdf",
            amount: 800,
            userName: "Tomas2"
        },
        {
            userId: "asdfasdf",
            amount: 400,
            userName: "Tomas3"
        },
        {
            userId: "asdfasdf",
            amount: 100,
            userName: "Tomas4"
        },
    ];

    constructor(private _messageService: MessagingService) {
        console.log('leaderboard component constructor');
        this._messageService.sendMessage(this._messageService.GetLeaderboard, undefined);

        let subscription = this._messageService.getLeaderboardResponseStream
            .subscribe((leaderboard: IGetLeaderboardResponse) => {
                if (leaderboard === undefined) {
                    console.error('Leaderboard response empty.');
                }

                this._leaderboardUsersStream.next(leaderboard.pourers);
            });
        
        this._messageService.pourNotificationStream.subscribe(pour => {
            if (pour.isFinished) {
                this._messageService.sendMessage(this._messageService.GetLeaderboard, undefined);
            }
        })

        this.leaderboardUserStreamWithPixelWidth = this._leaderboardUsersStream
            .asObservable()
            .map(leaderboard => {
                let maxScore = leaderboard[0].amount;
                leaderboard.map((pourer: IPourWithPXWidth) => pourer.width = (pourer.amount/maxScore)*100);
                return leaderboard;
            });
    }
}
