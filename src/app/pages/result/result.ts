import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TypingSpeedService } from '../../services/typing-speed.service';

@Component({
  selector: 'tst-result',
  imports: [RouterLink],
  templateUrl: './result.html',
  styleUrl: './result.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Result {
  #typingSpeedService: TypingSpeedService = inject(TypingSpeedService);

  wpm = toSignal(this.#typingSpeedService.getWpm$());
  accuracy = toSignal(this.#typingSpeedService.accuracy$);
}
