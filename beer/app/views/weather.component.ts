import { MessagingService, ITemperatureNotification } from './../infrastructure/messaging.service';
import { Component, Injectable } from '@angular/core';

@Component({
  selector: 'weather-component',
  templateUrl: './app/views/weather.component.html',
  styleUrls: ['./app/views/weather.component.css']
})

export class Weather {
  private _temperature: number;
  private _humidity: number;

  constructor(@Injectable() private _messageService: MessagingService) {
    _messageService.temperatureMessageStream.subscribe( (msg: ITemperatureNotification) => {
      this.temperature = msg.temperature;
      this.humidity = msg.humidity;
    });
  }

  get temperature(): number {
    return this._temperature;
  }

  set temperature(temperature: number) {
    this._temperature = temperature;
  }

  get humidity(): number {
    return this._humidity;
  }

  set humidity(humidity: number) {
    this._humidity = humidity;
  }
}