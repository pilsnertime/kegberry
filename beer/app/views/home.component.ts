import { Component } from '@angular/core';
import { MessagingService, ITemperatureNotification, IUser } from './../infrastructure/messaging.service';
import { Observable } from 'rxjs/Observable';
import { Weather } from './weather.component';

@Component({
  selector: 'my-app',
  templateUrl: './app/views/home.component.html',
  styleUrls: ['./app/views/home.component.css']
})

export class HomeComponent {
  private _pouring: boolean = false;

  constructor(private messageService: MessagingService) {}

  ngOnInit(): void {
    this.messageService.currentUserTimeoutNotification$.subscribe(_ => {
      this._pouring = false;
    });
  }

  onUserSelected(user: IUser) {
    this._pouring = true;
  }

  onPourFinished(_) {
    this._pouring = false;
  }

}
