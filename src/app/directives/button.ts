import { Directive, input } from '@angular/core';

type Variant = "primary" | "secondary" | "tertiary";

@Directive({
  selector: 'a[data-tstButton],button[data-tstButton]',
  host: {
    "class": "cursor-pointer px-6 py-4 rounded-[12px] text-xl font-semibold inline-flex items-center justify-center gap-x-2.5 transition-all duration-300 focus:outline-4 outline-offset-2 outline-neutral-0",
    "[class]": "classes[variant()]",
  },
})
export class Button {
  classes: Record<Variant, string> = {
    primary: "bg-blue-600 hover:bg-neutral-0 hover:text-blue-600",
    secondary: "bg-neutral-800 hover:bg-neutral-700",
    tertiary: "bg-neutral-0 text-neutral-900 hover:bg-neutral-200",
  }
  variant = input<Variant>("primary");
}
