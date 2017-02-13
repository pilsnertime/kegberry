import { MessagingService, IGetUserResponseNotification, IUser } from './messaging.service';
import { Component, Injectable } from '@angular/core';

@Component({
  selector: 'users-component',
  templateUrl: './app/users.component.html',
  styles: ['./app/users.component.html']
})
export class Users{
  private _users: IUser[] = new Array();
  constructor(@Injectable() private _messagingService: MessagingService) {
  }

    ngOnInit(): void {
        this._messagingService.readyStream.subscribe(() => {
            this._messagingService.sendMessage({name: this._messagingService.GetUsers, data: undefined});
        });

        this._messagingService.getUsersResponseStream.subscribe((msg: IGetUserResponseNotification) => {
            if (msg !== undefined) {
                this._users = msg.users;
            }
        });
    }

  get users(): IUser[] {
      return this._users;
  }

  set users(users: IUser[]) {
      this._users = users;
  }

}