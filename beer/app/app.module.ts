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
  declarations: [ HomeComponent ],
  bootstrap:    [ HomeComponent ]
})

export class AppModule { }
