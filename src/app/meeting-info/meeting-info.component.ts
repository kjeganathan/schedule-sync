import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

export interface RespondentChips {
  name: string;
  color: ThemePalette;
  response: string;
}

@Component({
  selector: 'app-meeting-info',
  templateUrl: './meeting-info.component.html',
  styleUrls: ['./meeting-info.component.css']
})
export class MeetingInfoComponent implements OnInit {
  availableColors: RespondentChips[] = [
    {name: 'abc@gmail.com', color: 'primary', response: 'check_circle_outline'},
    {name: 'def@gmail.com', color: 'primary', response: 'check_circle_outline'},
    {name: 'ghi@gmail.com', color: 'accent', response: 'help_outline'},
    {name: 'xyz@gmail.com', color: 'warn', response: 'highlight_off'},
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
