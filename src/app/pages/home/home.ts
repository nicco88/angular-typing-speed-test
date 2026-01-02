import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, distinctUntilChanged, filter, fromEvent, iif, map, of, scan, Subject, switchMap, takeUntil, takeWhile, tap, timer, withLatestFrom } from "rxjs";
import data from "./../../data.json";

type Difficulty = keyof typeof data;
type Mode = "TIMED" | "PASSAGE";
interface CharStateI {
  value: string;
  state: "PENDING" | "CORRECT" | "INCORRECT";
  historicalError: boolean;
}
@Component({
  selector: 'tst-home',
  imports: [FormsModule, AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild("settingsForm") settingsForm?: NgForm;

  difficulty: Difficulty = "easy";
  mode: Mode = "TIMED";

  readonly #MIN_CHAR_CODE = 33;
  readonly #MAX_CHAR_CODE = 126;
  readonly #COUNTDOWN_START_AT = 60;
  #randomTextIndex = 0;
  #startTime: number | null = null;

  readonly onDestroy$ = new Subject<void>();
  readonly testText$ = new BehaviorSubject<CharStateI[]>([]);
  readonly cursorPosition$ = new BehaviorSubject<number>(0);
  readonly mode$ = new BehaviorSubject<Mode>(this.mode);
  readonly testStarted$ = new BehaviorSubject<boolean>(false);
  readonly countdown$ = this.testStarted$.pipe(
    distinctUntilChanged(),
    switchMap(testStarted => iif(
      () => testStarted,
      timer(0, 1000).pipe(
        scan((acc) => acc - 1, this.#COUNTDOWN_START_AT + 1),
        takeWhile((countdown) => countdown >= 0),
        tap(countdown => {
          if (countdown === 0) {
            this._router.navigateByUrl("/result");
          }
        })
      ),
      of(this.#COUNTDOWN_START_AT)
    )),
    map(this.#secondsToStringTime),
  );
  readonly infiniteTimer$ = this.testStarted$.pipe(
    switchMap(testStarted => iif(
      () => testStarted,
      timer(0, 1000),
      of(0)
    )),
    map(this.#secondsToStringTime)
  )
  readonly time$ = this.mode$.pipe(
    switchMap((mode) => iif(
      () => mode === "TIMED",
      this.countdown$,
      this.infiniteTimer$
    ))
  );
  readonly wpm$ = new BehaviorSubject<number>(0);

  #getAccuracy = (testText: CharStateI[]) => {
    const correctChars = testText.length - this.#getWrongCharsCount(testText);

    if (correctChars === 0) return 0;

    return Math.round((correctChars * 100) / testText.length)
  }

  readonly accuracy$ = this.testText$.pipe(
    map(this.#getAccuracy)
  );

  constructor(private _router: Router) { }

  ngAfterViewInit(): void {
    this.#subscribeSettingsFormValueChanges();
    this.#subscribeDocumentKeydown();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onStartChallenge(): void {
    this.testStarted$.next(true);
  }

  onRestartChallenge(): void {
    this.#randomTextIndex = this.#getRandomIndex(data[this.difficulty].length);
    this.testText$.next(this.#getCharsState(data[this.difficulty][this.#randomTextIndex].text));
    this.cursorPosition$.next(0);
    this.testStarted$.next(false);
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
        filter(this.#isCharAllowed),
        withLatestFrom(this.cursorPosition$, this.testText$, this.testStarted$),
        tap(this.#handleKeyboardEffect),
        takeUntil(this.onDestroy$),
      )
      .subscribe()
  }

  #handleSettingsFormValueChangesEffect = ({ difficulty, mode }: { difficulty: Difficulty, mode: Mode }): void => {
    const charsState: CharStateI[] = this.#getCharsState(data[difficulty][this.#randomTextIndex].text);

    this.testText$.next(charsState);
    this.cursorPosition$.next(0);
    this.mode$.next(mode);
    this.onRestartChallenge();
  }

  #isCharAllowed = ({ code, key }: KeyboardEvent): boolean => {
    const charCode = key.charCodeAt(0);
    const isBackspace = code === "Backspace";
    const isSpace = code === "Space";
    const codeIsAllowed = charCode >= this.#MIN_CHAR_CODE && charCode <= this.#MAX_CHAR_CODE || isSpace;

    return (key.length === 1 || isBackspace) && codeIsAllowed;
  }

  #handleKeyboardEffect = ([event, cursorPosition, testText, testStarted]: [KeyboardEvent, number, CharStateI[], boolean]): void => {
    const isBackspace = event.code === "Backspace";

    if (testStarted) {
      const keyIsCorrect = testText[cursorPosition].value === event.key;

      testText[cursorPosition].state = keyIsCorrect ? "CORRECT" : "INCORRECT";

      if (!keyIsCorrect) {
        testText[cursorPosition].historicalError = true;
      }

      if (cursorPosition >= testText.length - 1) this._router.navigateByUrl("/result");
      if (isBackspace) return this.cursorPosition$.next(Math.max(cursorPosition - 1, 0));

      if (this.#startTime === null) {
        this.#startTime = performance.now();
      }

      const currentTime = performance.now();

      if (currentTime - this.#startTime > 0) {
        const completedChars = this.#getCompletedChars(testText);
        const wpm = this.#calculateWpm(completedChars, this.#startTime, currentTime);

        this.wpm$.next(wpm);
      }

      this.cursorPosition$.next(cursorPosition + 1);
      this.testText$.next(testText);
    } else {
      this.onStartChallenge();
    }
  }

  #getCharsState(text: string): CharStateI[] {
    return text.split("").map(char => ({ value: char, state: "PENDING", historicalError: false }));
  }

  #secondsToStringTime(seconds: number): string {
    const remainingMinutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${remainingMinutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  #getRandomIndex(max: number) {
    return Math.floor(Math.random() * max);
  }

  #calculateWpm(charCount: number, startTime: number, endTime: number): number {
    const timeInMs = endTime - startTime;
    const timeInMinutes = timeInMs / (1000 * 60);
    const STD_WORD_CHARS = 5;
    const wordCount = charCount / STD_WORD_CHARS;

    return Math.round(wordCount / timeInMinutes);
  }

  #getFirstPendingCharIndex(testText: CharStateI[]): number {
    return testText.findIndex(char => char.state === "PENDING");
  }

  #getCompletedChars(testText: CharStateI[]): number {
    if (this.#getFirstPendingCharIndex(testText) === -1) {
      return Math.min(this.#getFirstPendingCharIndex(testText) + 1, testText.length);
    }

    return this.#getFirstPendingCharIndex(testText);
  }

  #getWrongCharsCount(testText: CharStateI[]): number {
    return testText.filter(char => char.historicalError).length;
  }
}
