import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'pouring',
    templateUrl: 'pouring.component.html',
    styleUrls: ['pouring.component.css']
})
export class Pouring implements OnInit {

    @Output() pourFinished = new EventEmitter();

    constructor() { }

    ngOnInit(): void { }

    onPourFinished(event: any) {
        this.pourFinished.emit(event);
    }
}
