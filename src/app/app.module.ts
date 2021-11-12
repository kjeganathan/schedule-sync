import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { CalendarComponent } from './calendar/calendar.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { SchedulingComponent } from './scheduling/scheduling.component';
import { MeetingInfoComponent } from './meeting-info/meeting-info.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CalendarComponent,
    MeetingsComponent,
    SchedulingComponent,
    MeetingInfoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
