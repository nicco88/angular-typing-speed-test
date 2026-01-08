import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Button } from '../../directives/button';
import { TypingSpeedService } from '../../services/typing-speed.service';
import { ResultMetricsWrapper } from '../../components/result-metrics-wrapper/result-metrics-wrapper';
import { Confetti } from '../../components/confetti/confetti';

@Component({
  selector: 'tst-result',
  imports: [RouterLink, Button, ResultMetricsWrapper, Confetti],
  templateUrl: './result.html',
  styleUrl: './result.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Result implements OnInit {
  #typingSpeedService: TypingSpeedService = inject(TypingSpeedService);
  #router: Router = inject(Router);

  wpm = toSignal(this.#typingSpeedService.getWpm$());
  accuracy = toSignal(this.#typingSpeedService.accuracy$);
  rightVsWrongChars = toSignal(this.#typingSpeedService.rightVsWrongChars$);
  isPersonalBest = signal(false);
  isFirstTime = signal(false);

  constructor() {
    const currentNavigation = this.#router.currentNavigation();

    if (currentNavigation?.extras.state) {
      const { isFirstTime, isPersonalBest } = currentNavigation.extras.state as { isPersonalBest: boolean, isFirstTime: boolean };

      if (isFirstTime) this.isFirstTime.set(true);
      if (isPersonalBest) this.isPersonalBest.set(true);
    }

  }

  ngOnInit(): void {
    if (this.wpm() === 0 && this.accuracy() === 0) {
      this.#router.navigateByUrl("/");
    }
  }

}
