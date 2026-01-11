import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'tst-confetti',
  imports: [],
  templateUrl: './confetti.html',
  styleUrl: './confetti.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Confetti implements AfterViewInit {
  @ViewChild('confettiWrapper') svgRef?: ElementRef;

  #renderer: Renderer2 = inject(Renderer2);

  ngAfterViewInit() {
    if (!this.svgRef) return;

    const paths = this.svgRef.nativeElement.querySelectorAll('path');

    paths.forEach((path: HTMLElement) => {
      if (path.closest('clipPath') || path.closest('defs')) return;

      const duration = Math.random() * 2 + 4 + 's';
      const delay = Math.random() * -10 + 's';
      const drift = (Math.random() * 60 - 30) + 'px';

      path.style.setProperty('--drift', drift);

      this.#renderer.setStyle(path, 'animation', `confetti ${duration} linear infinite`);
      this.#renderer.setStyle(path, 'animation-delay', delay);
    });
  }
}
