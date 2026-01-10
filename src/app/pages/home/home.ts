import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, distinctUntilChanged, filter, fromEvent, Subject, takeUntil, tap, withLatestFrom } from "rxjs";
import { MetricsData } from '../../components/metrics-data/metrics-data';
import { MobileSettings } from '../../components/mobile-settings/mobile-settings';
import { Button } from '../../directives/button';
import { SettingsOption } from '../../directives/settings-option';
import { CharState, Difficulty, DifficultyOption, Mode, ModeOption } from '../../models/typing-speed.models';
import { TypingSpeedService } from '../../services/typing-speed.service';
import { UtilsService } from '../../services/utils.service';
import data from "./../../data.json";
import { difficultyOptions, modeOptions } from './home.config';
import { DesktopSettings } from "../../components/desktop-settings/desktop-settings";

@Component({
  selector: 'tst-home',
  imports: [FormsModule, AsyncPipe, MetricsData, SettingsOption, Button, NgTemplateOutlet, MobileSettings, DesktopSettings],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements AfterViewInit, OnDestroy {
  #router: Router = inject(Router);
  #typingSpeedService: TypingSpeedService = inject(TypingSpeedService);
  #utils: UtilsService = inject(UtilsService);

  difficultyOptions = difficultyOptions;
  modeOptions = modeOptions;

  @ViewChild("settingsForm") settingsForm?: NgForm;

  difficulty: Difficulty = "easy";
  mode: Mode = "TIMED";

  #randomTextIndex = 0;
  #startTime: number | null = null;

  readonly onDestroy$ = new Subject<void>();
  readonly testText$ = this.#typingSpeedService.getTestText$();
  readonly cursorPosition$ = new BehaviorSubject<number>(0);
  readonly testStarted$ = this.#typingSpeedService.getTestStarted$();
  readonly countdown$ = this.#typingSpeedService.countdown$;
  readonly infiniteTimer$ = this.#typingSpeedService.infiniteTimer$;
  readonly time$ = this.#typingSpeedService.time$;

  wpm = toSignal(this.#typingSpeedService.getWpm$());
  accuracy = toSignal(this.#typingSpeedService.accuracy$);
  time = toSignal(this.time$);

  difficultyLabel = signal<DifficultyOption["label"]>("Easy");
  modeLabel = signal<ModeOption["label"]>("Timed (60s)");

  ngAfterViewInit(): void {
    this.#subscribeSettingsFormValueChanges();
    this.#subscribeDocumentKeydown();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onStartChallenge(): void {
    this.#typingSpeedService.updateTestStarted(true)
  }

  onRestartChallenge(difficulty: Difficulty): void {
    this.#randomTextIndex = this.#utils.getRandomIndex(data[difficulty].length);

    const textByDifficulty = data[difficulty][this.#randomTextIndex].text;

    this.#typingSpeedService.updateTestText(this.#typingSpeedService.getCharsState(textByDifficulty));
    this.cursorPosition$.next(0);
    this.#typingSpeedService.updateTestStarted(false);
    this.#typingSpeedService.updateWpm(0);
    this.#startTime = null;
  }

  #subscribeSettingsFormValueChanges(): void {
    if (this.settingsForm?.valueChanges) {
      this.settingsForm.valueChanges
        .pipe(
          filter(({ difficulty, mode }) => difficulty && mode),
          distinctUntilChanged((prev, curr) => prev.difficulty === curr.difficulty && prev.mode === curr.mode),
          tap(this.#handleSettingsFormValueChangesEffect),
          takeUntil(this.onDestroy$))
        .subscribe();
    }
  }

  #subscribeDocumentKeydown(): void {
    fromEvent<KeyboardEvent>(document, "keydown")
      .pipe(
        filter(this.#typingSpeedService.isCharAllowed),
        withLatestFrom(this.cursorPosition$, this.testText$, this.testStarted$),
        tap(this.#handleKeyboardEffect),
        takeUntil(this.onDestroy$),
      )
      .subscribe()
  }

  #getLabelByValue<T extends DifficultyOption | ModeOption>(
    options: T[],
    value: T['value']
  ): T['label'] {
    return options.find(o => o.value === value)?.label ?? options[0]?.label;
  }

  #handleSettingsFormValueChangesEffect = ({ difficulty, mode }: { difficulty: Difficulty, mode: Mode }): void => {
    const charsState: CharState[] = this.#typingSpeedService.getCharsState(data[difficulty][this.#randomTextIndex].text);

    this.#typingSpeedService.updateTestText(charsState);
    this.cursorPosition$.next(0);
    this.#typingSpeedService.updateMode(mode);
    this.onRestartChallenge(difficulty);
    this.difficultyLabel.set(this.#getLabelByValue(difficultyOptions, difficulty));
    this.modeLabel.set(this.#getLabelByValue(modeOptions, mode));
  }

  #handleKeyboardEffect = ([event, cursorPosition, testText, testStarted]: [KeyboardEvent, number, CharState[], boolean]): void => {
    const isBackspace = event.code === "Backspace";

    if (testStarted && testText[cursorPosition]) {
      const keyIsCorrect = testText[cursorPosition].value === event.key;

      testText[cursorPosition].state = keyIsCorrect ? "CORRECT" : "INCORRECT";

      if (!keyIsCorrect) {
        testText[cursorPosition].historicalError = true;
      }

      if (event.code == "Space" && event.target == document.body) {
        // prevent scrolldown on space
        event.preventDefault();
      }

      if (cursorPosition >= testText.length - 1) {
        const { isFirstTime, isPersonalBest } = this.#typingSpeedService.getResultState(this.wpm());

        this.#router.navigateByUrl("/result", { state: { isFirstTime, isPersonalBest, finished: true } });
      };
      if (isBackspace) return this.cursorPosition$.next(Math.max(cursorPosition - 1, 0));

      if (this.#startTime === null) {
        this.#startTime = performance.now();
      }

      const currentTime = performance.now();

      if (currentTime - this.#startTime > 0 && this.accuracy() != null) {
        const completedChars = this.#typingSpeedService.getCompletedChars(testText);
        const wpm = this.#typingSpeedService.calculateWpm(completedChars, this.#startTime, currentTime);
        const netWpm = this.#typingSpeedService.calculateNetWpm(wpm, this.accuracy() as number);

        if (netWpm > 0) this.#typingSpeedService.updateWpm(netWpm);
      }

      this.cursorPosition$.next(cursorPosition + 1);
      this.#typingSpeedService.updateTestText(testText);
    } else {
      this.onStartChallenge();
    }
  }
}
