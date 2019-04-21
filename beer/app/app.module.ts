import { Pour } from './views/pour.component';
import { Users } from './views/users.component';
import { MessagingService } from './infrastructure/messaging.service';
import { Weather } from './views/weather.component';
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule, JsonpModule } from '@angular/http';
import { HomeComponent }   from './views/home.component';
import { RouterComponent }   from './views/router.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StatisticsComponent } from './views/statistics.component';
import { AddUserDialogComponent } from './views/add-user-dialog.component';
import { Pouring } from './views/pouring.component';
import { LeaderboardComponent } from './views/leaderboard.component';
import { BreweryMixer } from './views/brewery-mixer.component';

const appRoutes: Routes = [
  {
    path: 'stats',
    component: StatisticsComponent
  },
  {
    path: '**',
    component: HomeComponent
  }
];

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    JsonpModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  declarations: [ 
    HomeComponent,
    RouterComponent,
    Weather,
    Users,
    Pour,
    StatisticsComponent,
    AddUserDialogComponent,
    Pouring,
    LeaderboardComponent,
    BreweryMixer
  ],
  bootstrap:    [ RouterComponent ],
  providers: [ MessagingService ]
})

export class AppModule { }
