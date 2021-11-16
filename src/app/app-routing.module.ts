import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { LoginComponent } from './login/login.component';
import { MeetingInfoComponent } from './meeting-info/meeting-info.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { SchedulingComponent } from './scheduling/scheduling.component';

const routes: Routes = [
  { path: '', redirectTo: '/my-calendar', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'scheduling', component: SchedulingComponent},
  { path: 'my-meetings', component: MeetingsComponent },
  { path: 'my-calendar', component: CalendarComponent },
  { path: 'meeting-info', component: MeetingInfoComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }