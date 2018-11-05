import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'pouring',
    templateUrl: './app/views/pouring.component.html',
    styleUrls: ['./app/views/pouring.component.css']
})
export class Pouring implements OnInit {

    @Output() pourFinished = new EventEmitter();

    constructor() { }

    ngOnInit(): void { }

    onPourFinished(event: any) {
        this.pourFinished.emit(event);
    }
}
