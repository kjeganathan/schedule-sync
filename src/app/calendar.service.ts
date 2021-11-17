import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  calendarId: any;
  constructor(private http: HttpClient) { }

  getUserCalendars() {
    this.calendarId = 0;
    this.http.get(`https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}`)
  }
}
