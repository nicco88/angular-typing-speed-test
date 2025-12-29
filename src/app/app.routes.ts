import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: "",
    component: Home,
    pathMatch: "full",
  },
  {
    path: "result",
    loadComponent: () => import('./pages/result/result').then(m => m.Result),
  }
];
