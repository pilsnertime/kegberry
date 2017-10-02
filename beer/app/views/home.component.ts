import { Component } from '@angular/core';
import { MessagingService, ITemperatureNotification } from './../infrastructure/messaging.service';
import { Observable } from 'rxjs/Observable';
import { Weather } from './weather.component';

@Component({
  selector: 'my-app',
  templateUrl: './app/views/home.component.html'
})

export class HomeComponent {
  constructor(private messageService: MessagingService) {}

  ngOnInit(): void { 
  }

}
