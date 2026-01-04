import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

export const resultGuard: CanActivateFn = () => {
  const router = inject(Router);
  const currentNavigation = router.currentNavigation();
  const finished = !!currentNavigation?.extras.state?.["finished"]

  if (!finished) router.navigateByUrl("/");

  return finished;
}
