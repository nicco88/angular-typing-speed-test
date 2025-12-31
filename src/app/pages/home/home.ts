import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { BehaviorSubject, filter, fromEvent, Subject, takeUntil, tap, withLatestFrom } from "rxjs";
import data from "./../../data.json";

type Difficulty = keyof typeof data;
type Mode = "timed" | "passage";
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
  mode: Mode = "timed";

  readonly testText = data[this.difficulty][0].text;

  readonly MIN_CHAR_CODE = 33;
  readonly MAX_CHAR_CODE = 126;

  readonly testText$ = new BehaviorSubject<string[]>([]);
  readonly cursorPosition$ = new BehaviorSubject<number>(-1);
  readonly onDestroy$ = new Subject<void>();

  ngAfterViewInit(): void {
    if (this.settingsForm?.valueChanges) {
      this.settingsForm.valueChanges
        .pipe(
          tap(({ difficulty }: { difficulty: Difficulty, mode: Mode }) => {
            // TODO: modify text interface, to add char completion state
            this.testText$.next(data[difficulty][0].text.split(""));
            this.cursorPosition$.next(-1);
          }),
          takeUntil(this.onDestroy$))
        .subscribe();
    }

    fromEvent<KeyboardEvent>(document, "keydown")
      .pipe(
        filter(({ code, key }: KeyboardEvent) => {
          const charCode = key.charCodeAt(0);
          const isBackspace = code === "Backspace";
          const isSpace = code === "Space";
          const codeIsAllowed = charCode >= this.MIN_CHAR_CODE && charCode <= this.MAX_CHAR_CODE || isSpace;

          return (key.length === 1 || isBackspace) && codeIsAllowed;
        }),
        withLatestFrom(this.cursorPosition$, this.testText$),
        tap(([event, cursorPosition, testText]) => {
          const isBackspace = event.code === "Backspace";

          if (cursorPosition >= testText.length - 1) return this.cursorPosition$.next(-1);
          if (isBackspace) return this.cursorPosition$.next(Math.max(cursorPosition - 1, -1));

          this.cursorPosition$.next(cursorPosition + 1);
        }),
        takeUntil(this.onDestroy$),
      )
      .subscribe()
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
