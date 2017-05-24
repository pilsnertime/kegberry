import { Pour } from './pour.component';
import { Users } from './users.component';
import { MessagingService } from './messaging.service';
import { Weather } from './weather.component';
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, JsonpModule } from '@angular/http';
import { HomeComponent }   from './home.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
//import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    JsonpModule,
    NgbModule.forRoot(),
    //BrowserAnimationsModule
  ],
  declarations: [ HomeComponent, Weather, Users, Pour ],
  bootstrap:    [ HomeComponent ],
  providers: [MessagingService]
})

export class AppModule { }
