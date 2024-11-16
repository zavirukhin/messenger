import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MultilingualService {
  public saveLanguageToLocalStorage(language: string): void {
    localStorage.setItem('language', language);
  }
  
  public getLanguageFromLocalStorage(): string {
    const language = localStorage.getItem('language');
    return language ? language : '';
  }
}
