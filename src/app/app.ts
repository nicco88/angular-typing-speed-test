import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TypingSpeedService } from './services/typing-speed.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  #typingSpeedService: TypingSpeedService = inject(TypingSpeedService);

  personalBest = this.#typingSpeedService.personalBest;
}
