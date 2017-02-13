import { MessagingService } from './messaging.service';
import { Weather } from './weather.component';
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, JsonpModule } from '@angular/http';
import { HomeComponent }   from './home.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    JsonpModule
  ],
  declarations: [ HomeComponent, Weather ],
  bootstrap:    [ HomeComponent ],
  providers: [MessagingService]
})

export class AppModule { }
