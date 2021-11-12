import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

export interface ChipColor {
  name: string;
  color: ThemePalette;
}

@Component({
  selector: 'app-meeting-info',
  templateUrl: './meeting-info.component.html',
  styleUrls: ['./meeting-info.component.css']
})
export class MeetingInfoComponent implements OnInit {
  availableColors: ChipColor[] = [
    {name: 'abc@gmail.com', color: 'primary'},
    {name: 'def@gmail.com', color: 'primary'},
    {name: 'ghi@gmail.com', color: 'accent'},
    {name: 'xyz@gmail.com', color: 'warn'},
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
