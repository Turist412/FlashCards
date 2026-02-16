import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TtsService } from '../../../services/tts.service'; 

@Component({
  selector: 'app-speed-control',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './speed-control.component.html',
  styleUrls: ['./speed-control.component.scss']
})
export class SpeedControlComponent {
  constructor(public ttsService: TtsService) {}

  updateRate(value: number) {
    this.ttsService.rate = value;
  }
}