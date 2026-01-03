import { effect, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, distinctUntilChanged, iif, map, of, scan, share, switchMap, takeWhile, tap, timer, withLatestFrom } from "rxjs";
import { COUNTDOWN_START_AT, MAX_CHAR_CODE, MIN_CHAR_CODE, TYPING_SPEED_PERSONAL_BEST_WPM_KEY } from "../constants/typing-speed.constants";
import { CharState, Mode } from "../models/typing-speed.models";


@Injectable({ providedIn: "root" })
export class TypingSpeedService {
  #router: Router = inject(Router);

  constructor() {
    effect(() => {
      if (this.personalBest() != null) localStorage.setItem(TYPING_SPEED_PERSONAL_BEST_WPM_KEY, JSON.stringify(this.personalBest()));
    })
  }

  readonly #wpm$ = new BehaviorSubject<number>(0);
  readonly #testText$ = new BehaviorSubject<CharState[]>([]);
  readonly #testStarted$ = new BehaviorSubject<boolean>(false);
  readonly #mode$ = new BehaviorSubject<Mode>("TIMED");

  personalBest = signal<number>(
    JSON.parse(localStorage.getItem(TYPING_SPEED_PERSONAL_BEST_WPM_KEY) || "null")
    || 0,
  );

  readonly countdown$ = this.#testStarted$.pipe(
    distinctUntilChanged(),
    switchMap(testStarted => iif(
      () => testStarted,
      timer(0, 1000).pipe(
        scan((acc) => acc - 1, COUNTDOWN_START_AT + 1),
        takeWhile((countdown) => countdown >= 0),
        withLatestFrom(this.#wpm$),
        tap(([countdown, wpm]) => {
          if (countdown === 0) {
            this.shouldUpdatePersonalBest(wpm);

            this.#router.navigateByUrl("/result");
          }
        }),
        map(([countdown]) => countdown)
      ),
      of(COUNTDOWN_START_AT)
    )),
    map(this.secondsToStringTime),
  );

  readonly infiniteTimer$ = this.#testStarted$.pipe(
    switchMap(testStarted => iif(
      () => testStarted,
      timer(0, 1000),
      of(0)
    )),
    map(this.secondsToStringTime)
  )

  readonly time$ = this.#mode$.pipe(
    switchMap((mode) => iif(
      () => mode === "TIMED",
      this.countdown$,
      this.infiniteTimer$
    ))
  );

  #getAccuracy = (testText: CharState[]) => {
    const correctChars = testText.length - this.#getWrongCharsCount(testText);

    if (correctChars === 0) return 0;

    return Math.round((correctChars * 100) / testText.length)
  }

  readonly accuracy$ = this.#testText$.pipe(
    map(this.#getAccuracy),
    distinctUntilChanged(),
    share()
  );

  updateWpm(wpm: number): void {
    this.#wpm$.next(wpm);
  }

  getWpm$() {
    return this.#wpm$.asObservable().pipe(share());
  }

  updateTestText(testText: CharState[]): void {
    this.#testText$.next(testText);
  }

  getTestText$() {
    return this.#testText$.asObservable().pipe(share());
  }

  isCharAllowed = ({ code, key }: KeyboardEvent): boolean => {
    const charCode = key.charCodeAt(0);
    const isBackspace = code === "Backspace";
    const isSpace = code === "Space";
    const codeIsAllowed = charCode >= MIN_CHAR_CODE && charCode <= MAX_CHAR_CODE || isSpace;

    return (key.length === 1 || isBackspace) && codeIsAllowed;
  }

  getCharsState(text: string): CharState[] {
    return text.split("").map(char => ({ value: char, state: "PENDING", historicalError: false }));
  }

  secondsToStringTime(seconds: number): string {
    const remainingMinutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${remainingMinutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  calculateWpm(charCount: number, startTime: number, endTime: number): number {
    const timeInMs = endTime - startTime;
    const timeInMinutes = timeInMs / (1000 * 60);
    const STD_WORD_CHARS = 5;
    const wordCount = charCount / STD_WORD_CHARS;

    return wordCount / timeInMinutes;
  }

  calculateNetWpm(wpm: number, accuracy: number): number {
    return Math.round(wpm * (accuracy / 100));
  }


  getCompletedChars(testText: CharState[]): number {
    if (this.#getFirstPendingCharIndex(testText) === -1) {
      return Math.min(this.#getFirstPendingCharIndex(testText) + 1, testText.length);
    }

    return this.#getFirstPendingCharIndex(testText);
  }

  updateMode(mode: Mode): void {
    this.#mode$.next(mode);
  }

  updateTestStarted(testStarted: boolean): void {
    this.#testStarted$.next(testStarted);
  }

  getTestStarted$() {
    return this.#testStarted$.asObservable();
  }

  shouldUpdatePersonalBest(wpm: number | undefined) {
    if (wpm == null) return;

    const personalBest = this.personalBest();
    const isFirstTime = personalBest == null && wpm > 0;
    const isNewPersonalBest = personalBest != null && wpm > personalBest;

    if (isFirstTime || isNewPersonalBest) {
      this.personalBest.set(wpm);
    }
  }

  #getWrongCharsCount(testText: CharState[]): number {
    return testText.filter(char => char.historicalError).length;
  }

  #getFirstPendingCharIndex(testText: CharState[]): number {
    return testText.findIndex(char => char.state === "PENDING");
  }
}
