import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, filter, fromEvent, iif, map, of, scan, Subject, switchMap, takeUntil, takeWhile, tap, timer, withLatestFrom } from "rxjs";
import data from "./../../data.json";

type Difficulty = keyof typeof data;
type Mode = "TIMED" | "PASSAGE";
interface CharStateI {
  value: string;
  state: "PENDING" | "CORRECT" | "INCORRECT"
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

  readonly onDestroy$ = new Subject<void>();
  readonly testText$ = new BehaviorSubject<CharStateI[]>([]);
  readonly cursorPosition$ = new BehaviorSubject<number>(0);
  readonly mode$ = new BehaviorSubject<Mode>(this.mode);
  readonly testStarted$ = new BehaviorSubject<boolean>(false);
  readonly countdown$ = this.testStarted$.pipe(
    switchMap(testStarted => iif(
      () => testStarted,
      timer(0, 1000).pipe(
        scan((acc) => acc - 1, this.#COUNTDOWN_START_AT + 1),
        takeWhile((countdown) => countdown >= 0)
      ),
      of(this.#COUNTDOWN_START_AT)
    )),
    map(this.#secondsToStringTime)
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
      if (event.key === testText[cursorPosition].value) {
        testText[cursorPosition].state = "CORRECT";
      } else if (isBackspace) {
        // TODO: HANDLE BACKSPACE
        // this.testText$.next()
      } else {
        testText[cursorPosition].state = "INCORRECT";
      }

      if (cursorPosition >= testText.length - 1) return;
      if (isBackspace) return this.cursorPosition$.next(Math.max(cursorPosition - 1, 0));

      this.cursorPosition$.next(cursorPosition + 1);
      this.testText$.next(testText);
    } else {
      this.onStartChallenge();
    }
  }

  #getCharsState(text: string): CharStateI[] {
    return text.split("").map(char => ({ value: char, state: "PENDING" }));
  }

  #secondsToStringTime(seconds: number): string {
    const remainingMinutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${remainingMinutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  #getRandomIndex(max: number) {
    return Math.floor(Math.random() * max);
  }
}
