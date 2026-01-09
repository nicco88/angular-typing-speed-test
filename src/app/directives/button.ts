import { Directive, input } from '@angular/core';

type Variant = "primary" | "secondary" | "tertiary";

@Directive({
  selector: 'a[data-tstButton],button[data-tstButton]',
  host: {
    "class": "cursor-pointer px-6 py-4 rounded-[12px] text-xl font-semibold inline-flex items-center justify-center gap-x-2.5 transition-all duration-300 focus:outline-4 outline-offset-3 outline-blue-400",
    "[class]": "classes[variant()]",
  },
})
export class Button {
  classes: Record<Variant, string> = {
    primary: "bg-blue-600 hover:bg-blue-400",
    secondary: "bg-neutral-0 text-neutral-900 hover:bg-neutral-0/90",
    tertiary: "bg-neutral-800 hover:bg-neutral-700",
  }
  variant = input<Variant>("primary");
}
