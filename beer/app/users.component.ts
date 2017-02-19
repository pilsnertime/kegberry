import { MessagingService, IGetUserResponseNotification, IUser, IAddUserMessageData, IMessage, ISelectUserData } from './messaging.service';
import { Component, Injectable } from '@angular/core';

@Component({
  selector: 'users-component',
  templateUrl: './app/users.component.html',
  styleUrls: ['./app/users.component.css']
})
export class Users{
  private _users: IUser[] = [{"name":"tomas", "id":"1212"}];
  private _usernameInput: string = "";
  private _selectedUserId: string = "";
  constructor(@Injectable() private _messagingService: MessagingService) {
}

    ngOnInit(): void {
        this._messagingService.readyStream.subscribe(() => {
            this.getUsers();
        });

        this._messagingService.getUsersResponseStream.subscribe((msg: IGetUserResponseNotification) => {
            if (msg !== undefined) {
                this._users = msg.users;
            }
        });
    }

  addUser(): void {
      let data: IAddUserMessageData = {name: this.usernameInput};
      this._messagingService.sendMessage({messageName: this._messagingService.AddUser, data: data});
  }

  userSelected(user: IUser): void {
      let data: ISelectUserData = {id: user.id};
      let selectUserMessage: IMessage = {messageName: this._messagingService.SelectUser, data: data};
      this._messagingService.sendMessage(selectUserMessage);
      this.selectedUserId = user.id;
  }

  get users(): IUser[] {
      return this._users;
  }

  set users(users: IUser[]) {
      this._users = users;
  }

  get usernameInput(): string {
      return this._usernameInput;
  }

  set usernameInput(name: string) {
      this._usernameInput = name;
  }

  get selectedUserId(): string {
      return this._selectedUserId;
  }

  set selectedUserId(id: string) {
      this._selectedUserId = id;
  }

  private getUsers(): void {
      this._messagingService.sendMessage({messageName: this._messagingService.GetUsers, data: undefined});
  }

  onKey(event: any) {
      this._usernameInput = event.target.value;
  }

}