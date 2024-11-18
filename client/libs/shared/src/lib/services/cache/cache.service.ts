import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly cache: Map<string, BehaviorSubject<any>> = new Map();

  private readonly cacheKeyList: Set<string> = new Set();

  private session = localStorage.getItem('token');

  public set<T>(key: string, value: T): BehaviorSubject<T> {
    if (!this.isCurrentSession()) {
      this.destroyCache();
    }

    const cache = this.cache.get(key);

    if (cache === undefined) {
      const subject = new BehaviorSubject(value);
      this.cache.set(key, subject);
      this.cacheKeyList.add(key);

      return subject;
    }
    else {
      cache.next(value);

      return cache;
    }
  }

  public get<T>(key: string): BehaviorSubject<T> | null {
    if (!this.isCurrentSession()) {
      this.destroyCache();
    }

    const cache = this.cache.get(key);

    if (cache !== undefined) {
      return cache;
    }

    return null;
  }

  public destroyCache(): void {
    this.cacheKeyList.forEach((key) => {
      const cache = this.cache.get(key);
      cache?.complete();
    });

    this.cache.clear();
    this.cacheKeyList.clear();
    this.session = localStorage.getItem('token');
  }

  private isCurrentSession(): boolean {
    if (this.session === localStorage.getItem('token')) {
      return true;
    }

    return false;
  }
}