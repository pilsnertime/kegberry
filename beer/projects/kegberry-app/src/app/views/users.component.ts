import { MessagingService, IGetUserResponse, IUser, IAddUserMessageData, IMessage, ISelectUserData, IAddUserResponse } from './../infrastructure/messaging.service';
import { Component, Injectable, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'users-component',
  templateUrl: 'users.component.html',
  styleUrls: ['users.component.css']
})
export class Users {
    private _users: IUser[] = [];
    private _selectedUserId: string = "";
    private _subscriptions: Subscription[];
    addUserDialogActive: boolean = false;

    @Output() userSelected = new EventEmitter();

    constructor(@Injectable() private _messagingService: MessagingService) {}

    ngOnInit(): void {
        this._subscriptions = [
            this._messagingService.readyStream.subscribe(() => {
                this.getUsers();
            }),

            this._messagingService.getUsersResponseStream.subscribe((response: IGetUserResponse) => {
                if (response !== undefined) {
                    this.users = response.users;
                }
            }),

            this._messagingService.addUserResponseStream.subscribe((user: IAddUserResponse) => {
                if (user !== undefined) {
                    this.users.push(user);
                }
            })
        ]
    }

    ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());        
    }

    get users(): IUser[] {
        return this._users;
    }

    set users(users: IUser[]) {
        this._users = users;
    }

    get selectedUserId(): string {
        return this._selectedUserId;
    }

    set selectedUserId(id: string) {
        this._selectedUserId = id;
    }

    private getUsers(): void {
        this._messagingService.sendMessage(this._messagingService.GetUsers, undefined);
    }

    addUser(username: string): void {
        let data: IAddUserMessageData = {name: username};
        this._messagingService.sendMessage(this._messagingService.AddUser, data);
    }

    onUserSelected(user: IUser): void {
        let data: ISelectUserData = {id: user.id};
        this._messagingService.sendMessage(this._messagingService.SelectUser, data);
        this.selectedUserId = user.id;
        this.userSelected.emit(user);
    }

    onAddUserCommit(username: string) {
        this.addUserDialogActive = false;
        this.addUser(username);
    }

    onAddUserCancel(_: any) {
        this.addUserDialogActive = false;
    }
}