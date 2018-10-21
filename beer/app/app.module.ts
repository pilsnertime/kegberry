import { Pour } from './views/pour.component';
import { Users } from './views/users.component';
import { MessagingService } from './infrastructure/messaging.service';
import { Weather } from './views/weather.component';
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, JsonpModule } from '@angular/http';
import { HomeComponent }   from './views/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BreweryMixerComponent } from './views/brewery-mixer.component';
//import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    JsonpModule,
    NgbModule.forRoot(),
    //BrowserAnimationsModule
  ],
  declarations: [ HomeComponent, Weather, Users, Pour, BreweryMixerComponent ],
  bootstrap:    [ HomeComponent ],
  providers: [MessagingService]
})

export class AppModule { }
