import { Component } from '@angular/core';
import { MessagingService, ITemperatureNotification } from './messaging.service';
import { Observable } from 'rxjs/Observable';
import { Weather } from './weather.component';

// Add the RxJS Observable operators we need in this app
// import './rxjs-operators';

@Component({
  selector: 'my-app',
  templateUrl: './app/home.component.html'
})

export class HomeComponent {
  constructor(private messageService: MessagingService) {}

  ngOnInit(): void {
    
  }

}
