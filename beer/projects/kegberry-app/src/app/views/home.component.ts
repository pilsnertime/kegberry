import { Component } from '@angular/core';
import { MessagingService, ITemperatureNotification, IUser } from './../infrastructure/messaging.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})

export class HomeComponent {
  pouring: boolean = false;

  constructor(private messageService: MessagingService) {}

  ngOnInit(): void {
    this.messageService.currentUserTimeoutNotification$.subscribe(_ => {
      this.pouring = false;
    });
  }

  onUserSelected(user: IUser) {
    this.pouring = true;
  }

  onPourFinished(_) {
    this.pouring = false;
  }
}
