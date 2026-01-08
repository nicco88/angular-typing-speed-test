import { effect, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, distinctUntilChanged, filter, iif, map, of, scan, share, startWith, switchMap, takeLast, takeWhile, tap, timer, withLatestFrom } from "rxjs";
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

  readonly rightVsWrongChars$ = this.#testText$.pipe(
    filter(testText => testText.length > 0),
    map(testText => {
      const { correct, wrong } = this.#getCharsCount(testText);

      return { correctChars: correct, wrongChars: wrong };
    }),
    startWith({ correctChars: 0, wrongChars: 0 })
  )

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
            const isPersonalBest = this.shouldUpdatePersonalBest(wpm);

            this.#router.navigateByUrl("/result", { state: { isPersonalBest, finished: true } });
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
    const { pending, correctForAccuracy } = this.#getCharsCount(testText);

    if (pending === testText.length || correctForAccuracy === 0) return 0;

    return Math.round((correctForAccuracy * 100) / testText.length)
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

  shouldUpdatePersonalBest(wpm: number | undefined): boolean {
    if (wpm == null) return false;

    const personalBest = this.personalBest();
    const isFirstTime = personalBest == null && wpm > 0;
    const isNewPersonalBest = personalBest != null && wpm > personalBest;

    if (isFirstTime || isNewPersonalBest) {
      this.personalBest.set(wpm);

      return true;
    }

    return false;
  }

  #getCharsCount(testText: CharState[]): { pending: number, wrong: number, correct: number, correctForAccuracy: number } {
    return testText.reduce((result, charState) => {
      const pending = result.pending + (charState.state === "PENDING" ? 1 : 0);
      const wrong = result.wrong + (charState.historicalError ? 1 : 0);
      const correct = testText.length - wrong - pending;
      const correctForAccuracy = testText.length - wrong;

      return { pending, wrong, correct, correctForAccuracy }
    }, {
      pending: 0,
      wrong: 0,
      correct: 0,
      correctForAccuracy: testText.length,
    })
  }

  #getFirstPendingCharIndex(testText: CharState[]): number {
    return testText.findIndex(char => char.state === "PENDING");
  }
}
