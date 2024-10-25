import { Injectable } from '@angular/core';
import {
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  Observable, 
  startWith
} from 'rxjs';

export enum Screen {
  Mobile = 425,
  Tablet = 768,
  Desktop = 1024
};

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  private widthToScreenType(width: number): Screen {
    if (width <= Screen.Mobile) {
      return Screen.Mobile;
    }
    else if (width <= Screen.Tablet) {
      return Screen.Tablet;
    }
    return Screen.Desktop;
  }

  public getScreenType(): Observable<Screen> {
    return fromEvent(window, 'resize').pipe(
      filter(event => !!event.target),
      map(event => event.target),
      startWith(window),
      filter(target => target instanceof Window),
      map(target => target.innerWidth),
      map(this.widthToScreenType),
      distinctUntilChanged()
    );
  }
}
