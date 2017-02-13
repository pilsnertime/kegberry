import { Component } from '@angular/core';
import { MessagingService, ITemperatureMessage } from './messaging.service';
import { Observable } from 'rxjs/Observable';


// Add the RxJS Observable operators we need in this app
// import './rxjs-operators';

@Component({
  selector: 'my-app',
  templateUrl: './app/home.component.html',
  providers: [MessagingService]
})
export class HomeComponent {
  private _currentTemperature: number;
  constructor(private messageService: MessagingService) {}

  ngOnInit(): void {
    this.messageService.temperatureMessageStream.subscribe((temperature: ITemperatureMessage) => {
      if (temperature !== undefined) {
        this._currentTemperature = temperature.temperature;
      }
    });
  }

  get currentTemperature(): number {
    return this._currentTemperature;
  }

  set currentTemperature(currentTemperature: number) {
    this._currentTemperature = currentTemperature;
  }
}
