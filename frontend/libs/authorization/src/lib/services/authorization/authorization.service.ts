import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { NextAttempt } from '../../interfaces/next-attempt.interface';
import { Token } from '../../interfaces/token.interface';
import { CreateProfile } from '../../interfaces/create-profile.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private readonly http = inject(HttpClient);

  public sendCode(phone: string): Observable<NextAttempt> {
    return this.http.post<NextAttempt>(environment.apiUrl + '/auth/send-code', { phone });
  }

  public verifyPhone(phone: string, code: string): Observable<Token> {
    return this.http.post<Token>(environment.apiUrl + '/auth/validate-code', { phone, code });
  }

  public saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  public createProfile(profile: CreateProfile): Observable<Token> {
    return this.http.post<Token>(environment.apiUrl + '/auth/create-user', profile);
  }
}
