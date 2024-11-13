import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MultilingualService {
  saveLanguageToLocalStorage(language: string): void {
    localStorage.setItem('language', JSON.stringify(language));
  }
  
  getLanguageFromLocalStorage(): string {
    const language = localStorage.getItem('language');
    return language ? JSON.parse(language) : '';
  }
}
