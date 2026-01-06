import { Directive, input } from '@angular/core';

type Variant = "primary" | "secondary" | "tertiary";

@Directive({
  selector: 'a[data-tstButton],button[data-tstButton]',
  host: {
    "class": "cursor-pointer px-6 py-4 rounded-[12px] text-xl font-semibold inline-flex items-center justify-center gap-x-2.5 transition-all duration-300",
    "[class]": "classes[variant()]",
  },
})
export class Button {
  classes: Record<Variant, string> = {
    primary: "bg-blue-600",
    secondary: "bg-neutral-800",
    tertiary: "bg-neutral-0 text-neutral-900",
  }
  variant = input<Variant>("primary");
}
