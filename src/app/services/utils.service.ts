import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class UtilsService {
  getRandomIndex(max: number) {
    return Math.floor(Math.random() * max);
  }
}
