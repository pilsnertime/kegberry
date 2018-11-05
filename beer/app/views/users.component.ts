import { MessagingService, IGetUserResponse, IUser, IAddUserMessageData, IMessage, ISelectUserData, IAddUserResponse } from './../infrastructure/messaging.service';
import { Component, Injectable, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'users-component',
  templateUrl: './app/views/users.component.html',
  styleUrls: ['./app/views/users.component.css']
})
export class Users {
    private _users: IUser[] = [];
    private _usernameInput: string = "";
    private _selectedUserId: string = "";
    private _addUserDialogActive: boolean = false;

    @Output() userSelected = new EventEmitter();

    constructor(@Injectable() private _messagingService: MessagingService) {}

    ngOnInit(): void {
        this._messagingService.readyStream.subscribe(() => {
            this.getUsers();
        });

        this._messagingService.getUsersResponseStream.subscribe((response: IGetUserResponse) => {
            if (response !== undefined) {
                this.users = response.users;
            }
        });

        this._messagingService.addUserResponseStream.subscribe((user: IAddUserResponse) => {
            if (user !== undefined && user !== undefined) {
                this.users.push(user);
            }
        });
    }

    get users(): IUser[] {
        return this._users;
    }

    set users(users: IUser[]) {
        this._users = users;
    }

    getUserProfileAssetPath(user: IUser, index: number): string {
        // todo: implement user images
        return 'url("../assets/profile_' + index + '")';
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

    addUser(username: string): void {
        let data: IAddUserMessageData = {name: username};
        this._messagingService.sendMessage({messageName: this._messagingService.AddUser, data: data});
    }

    onUserSelected(user: IUser): void {
        let data: ISelectUserData = {id: user.id};
        let selectUserMessage: IMessage = {messageName: this._messagingService.SelectUser, data: data};
        this._messagingService.sendMessage(selectUserMessage);
        this.selectedUserId = user.id;
        this.userSelected.emit(user);
    }

    onAddUserCommit(username: string) {
        this._addUserDialogActive = false;
        this.addUser(username);
    }

    onAddUserCancel(_: any) {
        this._addUserDialogActive = false;
    }
}