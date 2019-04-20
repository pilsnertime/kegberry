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
    private _colors = [
        '#E74856',
        '#0078D7',
        '#0099BC',
        '#7A7574',
        '#767676',
        '#FF8C00',
        '#E81123',
        '#0063B1',
        '#2D7D9A',
        '#5D5A58',
        '#4C4A48',
        '#F7630C',
        '#EA005E',
        '#8E8CD8',
        '#00B7C3',
        '#68768A',
        '#CA5010',
        '#C30052',
        '#6B69D6',
        '#038387',
        '#515C6B',
        '#4A5459',
        '#DA3B01',
        '#E3008C',
        '#8764B8',
        '#00B294',
        '#567C73',
        '#647C64',
        '#EF6950',
        '#BF0077',
        '#744DA9',
        '#018574',
        '#486860',
        '#525E54',
        '#D13438',
        '#C239B3',
        '#B146C2',
        '#00CC6A',
        '#498205',
        '#FF4343',
        '#9A0089',
        '#881798',
        '#10893E',
        '#107C10',
        '#7E735F'
    ];

    private _topThreeColors = ['#ffb900', '#d3d3d3', '#cd7f32'];

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

    getColor(index: number) {
        if (index < 3) {
            return this.getTopThreeColor(index);
        }

        return this._colors[index - 3 % this._colors.length];
    }

    getTopThreeColor(index: number) {
        return this._topThreeColors[index % 3];
    }
}
