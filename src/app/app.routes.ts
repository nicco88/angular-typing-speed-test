import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { resultGuard } from './guards/result.guard';

export const routes: Routes = [
  {
    path: "",
    component: Home,
    pathMatch: "full",
  },
  {
    path: "result",
    loadComponent: () => import('./pages/result/result').then(m => m.Result),
    canActivate: [resultGuard],
  },
  {
    path: "**",
    redirectTo: "",
  },
];
