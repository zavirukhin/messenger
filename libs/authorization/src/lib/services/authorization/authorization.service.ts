import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
<<<<<<< HEAD
import { environment } from '@env';
import { NextAttempt } from '../../interfaces/next-attempt.interface';
import { Token } from '../../interfaces/token.interface';
=======
import { NextAttempt } from '../../interfaces/next-attempt.interface';
>>>>>>> 0f53e50 (feat(authorization): done auth page)

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private http = inject(HttpClient);

  public sendCode(phone: string): Observable<NextAttempt> {
    return this.http.post<NextAttempt>(environment.apiUrl + '/auth/send-code', { phone });
  }

  public verifyPhone(phone: string, code: string): Observable<Token> {
    return this.http.post<Token>(environment.apiUrl + '/auth/validate-code', { phone, code });
  }

  public saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  public getToken(): string {
    return localStorage.getItem('token') ?? '';
  }
}
