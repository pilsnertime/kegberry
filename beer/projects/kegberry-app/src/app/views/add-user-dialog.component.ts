import { Component, OnInit, Injectable, Output, EventEmitter } from '@angular/core';
import { MessagingService } from '../infrastructure/messaging.service';

@Component({
    selector: 'add-user-dialog',
    templateUrl: 'add-user-dialog.component.html',
    styleUrls: ['add-user-dialog.component.css']
})
export class AddUserDialogComponent {
    private _usernameInput: string = "";

    @Output() commit = new EventEmitter<string>();
    @Output() cancel = new EventEmitter<any>();

    onCommit() {
        this.commit.emit(this._usernameInput);
    }

    onCancel() {
        this.cancel.emit(undefined);
    }

    onKey(event: any) {
        this._usernameInput = event.target.value;
    }
}
